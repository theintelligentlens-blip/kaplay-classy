// The class-based game object. Subclass it, attach components in the
// constructor, override lifecycle methods, and add it to the game:
//
//     class Player extends GameObject {
//         speed = 240;
//
//         constructor() {
//             super(new Sprite("bean"), new Area(), new Body());
//             this.pos = vec2(100, 200);
//         }
//
//         update() {
//             if (this.pos.y >= this.game.height) this.destroy();
//         }
//     }
//
//     game.add(new Player());

import { color } from "../ecs/components/draw/color";
import { opacity } from "../ecs/components/draw/opacity";
import { anchor } from "../ecs/components/transform/anchor";
import { pos } from "../ecs/components/transform/pos";
import { rotate } from "../ecs/components/transform/rotate";
import { scale } from "../ecs/components/transform/scale";
import { z } from "../ecs/components/transform/z";
import { make } from "../ecs/entity/make";
import type { KEventController } from "../events/events";
import type { Color, ColorArgs } from "../math/color";
import { vec2 } from "../math/math";
import { calcTransform } from "../math/various";
import type { Vec2 } from "../math/Vec2";
import { _k } from "../shared";
import type { Anchor, Comp, GameObj, MergeComps, Tag } from "../types";
import { Component } from "./Component";
import type { Game } from "./Game";

/**
 * Anything that can be passed to the {@link GameObject} constructor:
 * class components, raw component definitions, tags, or plain data objects.
 *
 * @group Game Objects
 */
export type GameObjectPart =
    | Component<any>
    | Comp
    | Tag
    | Record<string, any>;

/**
 * Extracts the component state type from a {@link GameObjectPart}: the comp
 * interface from a Component class, a raw comp as-is, plain data objects
 * as-is, tags as nothing.
 *
 * @group Game Objects
 */
export type CompsOf<P> = P extends Component<infer C> ? C
    : P extends Tag ? never
    : P;

type StripIndexSignature<T> = {
    [K in keyof T as string extends K ? never : K]: T[K];
};

/**
 * A {@link GameObject} with statically-known component members, as returned
 * by `GameObject.with()` and `game.add([...])`:
 *
 *     const obj = game.add([new Sprite("bean"), new Health(8)]);
 *     obj.hp--; // typed!
 *
 * Unlike plain `GameObject`, it has no `any` index signature — only the
 * members of the components it was created with.
 *
 * @group Game Objects
 */
export type TypedGameObject<P> =
    & StripIndexSignature<GameObject>
    & MergeComps<CompsOf<P>>;

const unwrap = (part: GameObjectPart): Comp | Tag | Record<string, any> =>
    part instanceof Component ? part.state : part;

// Components with a safe default that can be attached automatically when
// another component depends on them (e.g. Body requires pos).
const injectable: Record<string, () => Comp> = {
    pos: () => pos(0, 0),
    scale: () => scale(1),
    rotate: () => rotate(0),
    opacity: () => opacity(1),
};

// Inject missing injectable dependencies and order components so that
// dependencies are attached before their dependents. The engine validates
// dependencies as each component is attached, so with a class constructor
// (where `this.pos = ...` runs after super()) we resolve what we can up
// front. Genuinely missing dependencies (like Area) still throw.
const resolveComps = (
    parts: (Comp | Tag | Record<string, any>)[],
): (Comp | Tag | Record<string, any>)[] => {
    const comps: Comp[] = [];
    const rest: (Tag | Record<string, any>)[] = [];

    for (const part of parts) {
        if (typeof part === "object" && part !== null && "id" in part) {
            comps.push(part as Comp);
        }
        else rest.push(part);
    }

    const ids = new Set(comps.map((c) => c.id).filter(Boolean) as string[]);
    const injected: Comp[] = [];

    for (const comp of comps) {
        for (const dep of comp.require ?? []) {
            if (!ids.has(dep) && injectable[dep]) {
                injected.push(injectable[dep]());
                ids.add(dep);
            }
        }
    }

    // Stable dependency ordering (deps the object doesn't have at all are
    // ignored here — the engine reports those)
    const ordered: Comp[] = [];
    const attached = new Set<string>();
    let remaining = [...injected, ...comps];

    while (remaining.length) {
        const ready = remaining.filter((c) =>
            (c.require ?? []).every((dep) => attached.has(dep) || !ids.has(dep))
        );

        // dependency cycle: hand it to the engine as-is
        if (!ready.length) {
            ordered.push(...remaining);
            break;
        }

        for (const comp of ready) {
            ordered.push(comp);
            if (comp.id) attached.add(comp.id);
        }

        remaining = remaining.filter((c) => !ready.includes(c));
    }

    return [...ordered, ...rest];
};

// Forwards unknown properties (component state like `hp`, component methods
// like `jump()`) to the underlying engine object, so `this.hp--` works in
// subclasses without manual plumbing.
const forwardingHandler: ProxyHandler<GameObject> = {
    get(target, prop, receiver) {
        if (prop in target) return Reflect.get(target, prop, receiver);
        const raw = target.raw as any;
        if (raw && prop in raw) {
            const value = raw[prop];
            return typeof value === "function" ? value.bind(raw) : value;
        }
        return undefined;
    },
    set(target, prop, value) {
        if (!(prop in target)) {
            const raw = target.raw as any;
            if (raw && prop in raw) {
                raw[prop] = value;
                return true;
            }
        }
        return Reflect.set(target, prop, value);
    },
    has(target, prop) {
        return prop in target
            || (target.raw ? prop in (target.raw as any) : false);
    },
};

/**
 * The base class for all game objects.
 *
 * Compose behavior by passing components to the constructor (or calling
 * `use()`), and/or extend the class and override the lifecycle methods
 * `onAdd()`, `update()`, `fixedUpdate()`, `draw()` and `onDestroy()`.
 *
 * Properties and methods provided by components (like `hp` from
 * {@link Component Health} or `jump()` from Body) are forwarded, so they can
 * be accessed directly on the object.
 *
 * @group Game Objects
 */
export class GameObject {
    // Component-provided members (hp, jump(), isGrounded()...) are forwarded
    // at runtime; the index signature keeps TypeScript subclasses compiling.
    [key: string]: any;

    /**
     * The underlying engine object. Escape hatch for anything not exposed
     * through the class API.
     */
    readonly raw: GameObj<any>;

    /**
     * The game this object was added to. Set when the object is added.
     */
    game!: Game;

    constructor(...parts: GameObjectPart[]) {
        if (!_k) {
            throw new Error(
                "No Game running. Create a `new Game()` before constructing GameObjects.",
            );
        }

        this.raw = make(resolveComps(parts.map(unwrap)) as any);

        const proxy = new Proxy(this, forwardingHandler);
        (this.raw as any)._classy = proxy;
        return proxy;
    }

    /**
     * Create a GameObject with statically-typed component members:
     *
     *     const bean = game.add(GameObject.with(new Sprite("bean"), new Health(8)));
     *     bean.hp--; // typed!
     */
    static with<P extends GameObjectPart[]>(
        ...parts: [...P]
    ): TypedGameObject<P[number]> {
        return new GameObject(...parts) as unknown as TypedGameObject<
            P[number]
        >;
    }

    // #region Lifecycle (override these)

    /** Called once, right after the object is added to the game. */
    onAdd(): void {}

    /** Called every frame. */
    update(): void {}

    /** Called at a fixed rate, for physics-style logic. */
    fixedUpdate(): void {}

    /** Called every frame after update, for custom drawing. */
    draw(): void {}

    /** Called when the object is destroyed. */
    onDestroy(): void {}

    // #endregion

    // #region Components

    /**
     * Attach a component. Returns the component, so the typed state can be
     * kept around: `const health = this.use(new Health(8));`
     */
    use<T extends Component<any> | Comp>(component: T): T {
        this.raw.use(
            component instanceof Component ? component.state : component,
        );
        return component;
    }

    /** Remove a component by id (e.g. `"body"`). */
    unuse(id: string): void {
        this.raw.unuse(id);
    }

    /** Check if the object has a component. */
    has(id: string | string[], op?: "and" | "or"): boolean {
        return this.raw.has(id, op);
    }

    /** Get the live state of a component by id. */
    comp<C extends Comp = Comp>(id: string): C | null {
        return this.raw.c(id) as C | null;
    }

    // #endregion

    // #region Tags

    /** Add a tag (or several). */
    tag(t: Tag | Tag[]): this {
        this.raw.tag(t);
        return this;
    }

    /** Remove a tag (or several). */
    untag(t: Tag | Tag[]): this {
        this.raw.untag(t);
        return this;
    }

    /** Check if the object has a tag. */
    is(t: Tag | Tag[], op?: "and" | "or"): boolean {
        return this.raw.is(t, op);
    }

    /** All tags of this object. */
    get tags(): string[] {
        return this.raw.tags;
    }

    // #endregion

    // #region Tree

    /**
     * Add a child object.
     */
    add<T extends GameObject>(child: T): T;
    add<P extends GameObjectPart[]>(parts: [...P]): TypedGameObject<P[number]>;
    add(child: GameObject | GameObjectPart[]): GameObject {
        const obj = Array.isArray(child) ? new GameObject(...child) : child;
        return obj._attach(this.raw, this.game);
    }

    /** Remove and re-add the object, so it renders on top of its siblings. */
    readd(): void {
        this.raw.parent?.readd(this.raw);
    }

    /** Destroy the object and all its children. */
    destroy(): void {
        this.raw.destroy();
    }

    /** Whether the object is attached to the game. */
    exists(): boolean {
        return this.raw.exists();
    }

    /** The unique runtime id of the object. */
    get id(): number {
        return this.raw.id;
    }

    /** The parent engine object, if any. */
    get parent(): GameObj | null {
        return this.raw.parent;
    }

    /** Child objects. GameObjects where available, engine objects otherwise. */
    get children(): (GameObject | GameObj)[] {
        return this.raw.children.map((c: any) => c._classy ?? c);
    }

    /** Pause or resume update/draw/input for this object. */
    get paused(): boolean {
        return this.raw.paused;
    }

    set paused(value: boolean) {
        this.raw.paused = value;
    }

    /** Hide or show the object (children included). */
    get hidden(): boolean {
        return this.raw.hidden;
    }

    set hidden(value: boolean) {
        this.raw.hidden = value;
    }

    // #endregion

    // #region Events

    /** Listen to an event on this object. */
    on(name: string, action: (...args: any[]) => void): KEventController {
        return this.raw.on(name, action);
    }

    /** Trigger an event on this object. */
    trigger(name: string, ...args: any[]): void {
        this.raw.trigger(name, ...args);
    }

    // #endregion

    // #region Convenience accessors
    // Setting one of these without the matching component attaches the
    // component automatically.

    /** Position, in pixels. Requires (or auto-attaches) Pos. */
    get pos(): Vec2 {
        return (this.raw as any).pos;
    }

    set pos(value: Vec2) {
        if ((this.raw as any).pos !== undefined) {
            (this.raw as any).pos = value;
        }
        else this.use(new Component(pos(value)));
    }

    /** Rotation, in degrees. Requires (or auto-attaches) Rotate. */
    get angle(): number {
        return (this.raw as any).angle;
    }

    set angle(value: number) {
        if ((this.raw as any).angle !== undefined) {
            (this.raw as any).angle = value;
        }
        else this.use(new Component(rotate(value)));
    }

    /** Scale. Requires (or auto-attaches) Scale. */
    get scale(): Vec2 {
        return (this.raw as any).scale;
    }

    set scale(value: Vec2 | number) {
        const v = typeof value === "number" ? vec2(value) : value;
        if ((this.raw as any).scale !== undefined) {
            (this.raw as any).scale = v;
        }
        else this.use(new Component(scale(v)));
    }

    /** Depth within a layer. Requires (or auto-attaches) Z. */
    get z(): number {
        return (this.raw as any).z;
    }

    set z(value: number) {
        if ((this.raw as any).z !== undefined) (this.raw as any).z = value;
        else this.use(new Component(z(value)));
    }

    /** Opacity (0–1). Requires (or auto-attaches) Opacity. */
    get opacity(): number {
        return (this.raw as any).opacity;
    }

    set opacity(value: number) {
        if ((this.raw as any).opacity !== undefined) {
            (this.raw as any).opacity = value;
        }
        else this.use(new Component(opacity(value)));
    }

    /** Color tint. Requires (or auto-attaches) ColorComp. */
    get color(): Color {
        return (this.raw as any).color;
    }

    set color(value: ColorArgs[0]) {
        if ((this.raw as any).color !== undefined) {
            (this.raw as any).color = value;
        }
        else this.use(new Component(color(value as any)));
    }

    /** Anchor point for rendering. Requires (or auto-attaches) Anchor. */
    get anchorPoint(): Anchor | Vec2 {
        return (this.raw as any).anchor;
    }

    set anchorPoint(value: Anchor | Vec2) {
        if ((this.raw as any).anchor !== undefined) {
            (this.raw as any).anchor = value;
        }
        else this.use(new Component(anchor(value)));
    }

    // #endregion

    /**
     * Attach this object to a parent engine object and wire up lifecycle
     * methods. Used by `Game.add()` and `GameObject.add()`.
     *
     * @internal
     */
    _attach(parent: GameObj, game: Game): this {
        const raw = this.raw as any;

        if (raw.parent) {
            throw new Error("GameObject was already added to the game.");
        }

        this.game = game;
        raw.parent = parent;
        calcTransform(raw, raw.transform);

        _k.game.gameObjEvents.trigger("add", raw);
        raw.trigger("add", raw);

        // Only wire lifecycle methods that are actually overridden
        const base = GameObject.prototype;
        if (this.update !== base.update) {
            raw.onUpdate(() => this.update());
        }
        if (this.fixedUpdate !== base.fixedUpdate) {
            raw.onFixedUpdate(() => this.fixedUpdate());
        }
        if (this.draw !== base.draw) {
            raw.onDraw(() => this.draw());
        }
        if (this.onDestroy !== base.onDestroy) {
            raw.onDestroy(() => this.onDestroy());
        }

        this.onAdd();

        return this;
    }
}
