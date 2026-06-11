// The Game class — the entry point of every KAPLAY Classy game.
//
//     import { Game, Sprite } from "kaplay-classy";
//
//     const game = new Game({ background: "#6d80fa" });
//     await game.assets.loadSprite("bean", "sprites/bean.png");
//     game.add([new Sprite("bean")]);

import { trigger } from "../api/eventHandlers";
import { createEngine, type Engine } from "../core/engine";
import { quit } from "../core/quit";
import { _setTopMostOnlyActivate } from "../ecs/components/physics/area";
import { createCollisionSystem } from "../ecs/systems/createCollisionSystem";
import { system, SystemPhase } from "../ecs/systems/systems";
import type { ScopeHandlers } from "../events/scopeHandlers";
import {
    getGravity,
    getGravityDirection,
    setGravity,
    setGravityDirection,
} from "../game/gravity";
import { getDefaultLayer, getLayers, setLayers } from "../game/layers";
import { getBackground, setBackground } from "../gfx/bg";
import { center, height, width } from "../gfx/stack";
import type { Color, ColorArgs } from "../math/color";
import type { Vec2 } from "../math/Vec2";
import { _k, updateEngine } from "../shared";
import type { GameObj, KAPLAYOpt } from "../types";
import { AssetManager } from "./AssetManager";
import { AudioManager } from "./AudioManager";
import { Camera } from "./Camera";
import { GameObject, type GameObjectPart } from "./GameObject";
import { InputManager } from "./InputManager";
import { SceneManager } from "./Scene";

/**
 * Options for creating a {@link Game}.
 *
 * @group Start
 */
export type GameOpt = KAPLAYOpt;

const wrap = (obj: any): GameObject | GameObj => obj._classy ?? obj;

/**
 * A KAPLAY Classy game. Creating one boots the engine: it creates (or takes
 * over) a canvas, starts the game loop, and exposes every subsystem as a
 * class instance:
 *
 * - `game.assets` — asset loading
 * - `game.input` — keyboard / mouse / touch / gamepad
 * - `game.audio` — sound playback and volume
 * - `game.camera` — the scene camera
 * - `game.scenes` — scene registration and switching
 *
 * Only one Game can run at a time.
 *
 * @group Start
 */
export class Game {
    /** The currently running game, if any. */
    static current: Game | null = null;

    private readonly engine: Engine;
    private readonly scope: ScopeHandlers;

    /** Loads and retrieves assets. */
    readonly assets: AssetManager;
    /** Input state and events. */
    readonly input: InputManager;
    /** Sound playback and volume. */
    readonly audio: AudioManager;
    /** The scene camera. */
    readonly camera: Camera;
    /** Scene registration and switching. */
    readonly scenes: SceneManager;

    constructor(opt: GameOpt = {}) {
        if (Game.current) {
            console.warn(
                "A Game was already running, cleaning up previous state...",
            );
            Game.current = null;
            updateEngine(null as unknown as Engine);
        }

        updateEngine(createEngine(opt));
        this.engine = _k;
        Game.current = this;

        const { checkFrame, retrieve } = createCollisionSystem({
            broad: opt.broadPhaseCollisionAlgorithm || "sap",
            narrow: opt.narrowPhaseCollisionAlgorithm || "gjk",
        });

        this.engine.game.retrieve = retrieve;

        _setTopMostOnlyActivate(opt.topMostOnlyActivate ?? false);

        system("collision", checkFrame, [
            SystemPhase.AfterFixedUpdate,
            SystemPhase.AfterUpdate,
        ]);

        this.engine.startLoop();

        this.scope = opt.defaultLifetimeScope === "app"
            ? this.engine.appScope
            : this.engine.sceneScope;

        this.assets = new AssetManager(this.scope);
        this.input = new InputManager(this.engine.app, this.scope);
        this.audio = new AudioManager(this.engine.audio);
        this.camera = new Camera();
        this.scenes = new SceneManager(this, this.scope);

        if (opt.focus !== false) {
            this.engine.app.canvas.focus();
        }
    }

    private get root() {
        return this.engine.game.root;
    }

    // #region Objects

    /**
     * Add a game object to the scene — either a {@link GameObject} (or
     * subclass) instance, or a plain list of components/tags.
     */
    add<T extends GameObject>(obj: T): T;
    add(parts: GameObjectPart[]): GameObject;
    add(obj: GameObject | GameObjectPart[]): GameObject {
        const gameObject = Array.isArray(obj) ? new GameObject(...obj) : obj;
        return gameObject._attach(this.root, this);
    }

    /** Remove all objects with a tag (or every object if no tag is given). */
    destroyAll(tag?: string): void {
        if (tag === undefined) this.root.removeAll();
        else this.root.removeAll(tag);
    }

    /** Get top-level objects, optionally filtered by tag. */
    get(tag: string, opts?: { recursive?: boolean; liveUpdate?: boolean }) {
        return this.root.get(tag, opts).map(wrap);
    }

    /** Query objects by distance, components, tags... */
    get query() {
        return this.root.query.bind(this.root);
    }

    // #endregion

    // #region Global events

    /** Run a callback every frame, optionally per object with a tag. */
    get onUpdate() {
        return this.scope.onUpdate;
    }
    /** Run a callback at a fixed rate, for physics-style logic. */
    get onFixedUpdate() {
        return this.scope.onFixedUpdate;
    }
    /** Run a callback every frame at draw time. */
    get onDraw() {
        return this.scope.onDraw;
    }
    /** Run when an object with a tag is added. */
    get onAdd() {
        return this.scope.onAdd;
    }
    /** Run when an object with a tag is destroyed. */
    get onDestroy() {
        return this.scope.onDestroy;
    }
    /** Run when an object with a tag is clicked. */
    get onClick() {
        return this.scope.onClick;
    }
    /** Run when two tagged objects collide. */
    get onCollide() {
        return this.scope.onCollide;
    }
    /** Run every frame while two tagged objects collide. */
    get onCollideUpdate() {
        return this.scope.onCollideUpdate;
    }
    /** Run when two tagged objects stop colliding. */
    get onCollideEnd() {
        return this.scope.onCollideEnd;
    }
    /** Run when the mouse starts hovering a tagged object. */
    get onHover() {
        return this.scope.onHover;
    }
    /** Run every frame while the mouse hovers a tagged object. */
    get onHoverUpdate() {
        return this.scope.onHoverUpdate;
    }
    /** Run when the mouse stops hovering a tagged object. */
    get onHoverEnd() {
        return this.scope.onHoverEnd;
    }
    /** Run when a tagged object gains a component. */
    get onUse() {
        return this.scope.onUse;
    }
    /** Run when a tagged object loses a component. */
    get onUnuse() {
        return this.scope.onUnuse;
    }
    /** Run when an object gains a tag. */
    get onTag() {
        return this.scope.onTag;
    }
    /** Run when an object loses a tag. */
    get onUntag() {
        return this.scope.onUntag;
    }
    /** Listen to a custom event on tagged objects. */
    get on() {
        return this.scope.on;
    }
    /** Run when the canvas resizes. */
    get onResize() {
        return this.scope.onResize;
    }
    /** Run when an uncaught error happens in the game loop. */
    get onError() {
        return this.scope.onError;
    }
    /** Register cleanup to run when the game quits. */
    get onCleanup() {
        return this.scope.onCleanup;
    }
    /** Run when leaving a scene. */
    get onSceneLeave() {
        return this.scope.onSceneLeave;
    }
    /** Run when the tab becomes hidden. */
    get onHide() {
        return this.scope.onHide;
    }
    /** Run when the tab becomes visible again. */
    get onShow() {
        return this.scope.onShow;
    }

    /** Trigger a custom event on all objects with a tag. */
    readonly trigger = trigger;

    // #endregion

    // #region Timers

    /** Run a callback after n seconds. */
    get wait() {
        return this.root.wait.bind(this.root);
    }

    /** Run a callback every n seconds. */
    get loop() {
        return this.root.loop.bind(this.root);
    }

    /** Tween a value over time. */
    get tween() {
        return this.root.tween.bind(this.root);
    }

    // #endregion

    // #region Screen & timing

    /** Game width, in pixels. */
    get width(): number {
        return width();
    }

    /** Game height, in pixels. */
    get height(): number {
        return height();
    }

    /** The center point of the screen. */
    get center(): Vec2 {
        return center();
    }

    /** Delta time since last frame, in seconds. */
    get dt(): number {
        return this.engine.app.dt();
    }

    /** Fixed delta time, in seconds. */
    get fixedDt(): number {
        return this.engine.app.fixedDt();
    }

    /** Remaining accumulator time after fixed updates, in seconds. */
    get restDt(): number {
        return this.engine.app.restDt();
    }

    /** Total time since the game started, in seconds. */
    get time(): number {
        return this.engine.app.time();
    }

    // #endregion

    // #region World

    /** Background color (or transparent if created with no background). */
    get background(): Color | null {
        return getBackground();
    }

    set background(value: ColorArgs[0]) {
        setBackground(value as any);
    }

    /** Gravity strength, in pixels per second². 0 unless set. */
    get gravity(): number {
        return getGravity();
    }

    set gravity(value: number) {
        setGravity(value);
    }

    /** Gravity direction. Defaults to down (0, 1). */
    get gravityDirection(): Vec2 {
        return getGravityDirection();
    }

    set gravityDirection(value: Vec2) {
        setGravityDirection(value);
    }

    /** Define the render layers of the game, and the default one. */
    setLayers(layerNames: string[], defaultLayer: string): void {
        setLayers(layerNames, defaultLayer);
    }

    /** The render layer names, if defined. */
    get layers(): string[] | null {
        return getLayers();
    }

    /** The default render layer, if layers are defined. */
    get defaultLayer(): string | null {
        return getDefaultLayer();
    }

    // #endregion

    // #region Misc

    /** The canvas element the game renders to. */
    get canvas(): HTMLCanvasElement {
        return this.engine.app.canvas;
    }

    /** The debug interface: pause, time scale, logs, object inspection... */
    get debug() {
        return this.engine.debug;
    }

    /** Whether the game canvas is currently focused. */
    isFocused(): boolean {
        return this.engine.app.isFocused();
    }

    /** Enter or exit fullscreen. */
    setFullscreen(fullscreen?: boolean): void {
        this.engine.app.setFullscreen(fullscreen);
    }

    /** Whether the game is fullscreen. */
    isFullscreen(): boolean {
        return this.engine.app.isFullscreen();
    }

    /** Take a screenshot, returned as a data URL. */
    screenshot(): string {
        return this.engine.app.screenshot();
    }

    /** End the game: stop the loop and clean everything up. */
    quit(): void {
        Game.current = null;
        quit();
    }

    // #endregion
}
