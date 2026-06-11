// The scene camera, available as `game.camera`.

import {
    flash,
    getCamPos,
    getCamRot,
    getCamScale,
    getCamTransform,
    setCamPos,
    setCamRot,
    setCamScale,
    shake,
    toScreen,
    toWorld,
} from "../game/camera";
import type { Mat23 } from "../math/math";
import type { Vec2 } from "../math/Vec2";

/**
 * Controls the scene camera. Available as `game.camera`.
 *
 * @group Camera
 */
export class Camera {
    /** Camera position, in world coordinates. Defaults to screen center. */
    get pos(): Vec2 {
        return getCamPos();
    }

    set pos(value: Vec2) {
        setCamPos(value);
    }

    /** Camera zoom. */
    get scale(): Vec2 {
        return getCamScale();
    }

    set scale(value: Vec2 | number) {
        setCamScale(value as Vec2);
    }

    /** Camera rotation, in degrees. */
    get angle(): number {
        return getCamRot();
    }

    set angle(value: number) {
        setCamRot(value);
    }

    /** The current camera transform matrix. */
    get transform(): Mat23 {
        return getCamTransform();
    }

    /** Shake the camera. */
    readonly shake = shake;

    /** Flash the screen with a color. */
    readonly flash = flash;

    /** Transform a world point to screen coordinates. */
    readonly toScreen = toScreen;

    /** Transform a screen point to world coordinates. */
    readonly toWorld = toWorld;
}
