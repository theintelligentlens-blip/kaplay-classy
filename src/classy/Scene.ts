// Class-based scenes:
//
//     class Title extends Scene {
//         onEnter() {
//             this.game.add([new Text("press space")]);
//             this.game.input.onKeyPress("space", () => this.game.scenes.go(Gameplay));
//         }
//     }
//
//     game.scenes.add(Title);
//     game.scenes.go(Title);

import type { Engine } from "../core/engine";
import type { ScopeHandlers } from "../events/scopeHandlers";
import {
    getSceneArgs,
    getSceneName,
    go,
    popScene,
    pushScene,
    scene,
    type SceneDef,
} from "../game/scenes";
import type { Game } from "./Game";

/**
 * Base class for scenes. Override `onEnter()` (required) and `onLeave()`
 * (optional). A fresh instance is created every time the scene is entered.
 *
 * @group Scenes
 */
export abstract class Scene {
    /**
     * The scene id used with `go()`. Defaults to the class name.
     */
    static sceneName?: string;

    constructor(readonly game: Game) {}

    /** Called when the scene is entered, with the args passed to `go()`. */
    abstract onEnter(...args: any[]): void;

    /** Called when the game leaves this scene. */
    onLeave(nextScene: string): void {}
}

/**
 * A class extending {@link Scene}.
 *
 * @group Scenes
 */
export type SceneClass = (new(game: Game) => Scene) & { sceneName?: string };

const sceneId = (target: SceneClass | string): string =>
    typeof target === "string"
        ? target
        : target.sceneName ?? target.name;

/**
 * Registers and switches scenes. Available as `game.scenes`.
 *
 * @group Scenes
 */
export class SceneManager {
    constructor(
        private readonly game: Game,
        private readonly scope: ScopeHandlers,
    ) {}

    /**
     * Register a Scene class. The scene id defaults to the class name and
     * can be overridden with a static `sceneName` or the `name` parameter.
     *
     * Returns the scene id.
     */
    add(SceneType: SceneClass, name?: string): string {
        const id = name ?? sceneId(SceneType);

        scene(id, (...args: unknown[]) => {
            const instance = new SceneType(this.game);

            if (instance.onLeave !== Scene.prototype.onLeave) {
                this.scope.onSceneLeave((next?: string) =>
                    instance.onLeave(next ?? "")
                );
            }

            instance.onEnter(...args);
        });

        return id;
    }

    /** Register a scene from a plain function instead of a class. */
    define(name: string, def: SceneDef): void {
        scene(name, def);
    }

    /** Switch to a scene, by class or id. */
    go(target: SceneClass | string, ...args: unknown[]): void {
        go(sceneId(target), ...args);
    }

    /** Switch to a scene, remembering the current one for `pop()`. */
    push(target: SceneClass | string, ...args: unknown[]): void {
        pushScene(sceneId(target), ...args);
    }

    /** Return to the scene that `push()` was called from. */
    pop(): void {
        popScene();
    }

    /** The id of the current scene, if any. */
    get current(): string | null {
        return getSceneName();
    }

    /** The args the current scene was entered with. */
    get args(): unknown[] {
        return getSceneArgs() as unknown[];
    }
}
