// The class-based component API. Every engine component factory is wrapped in
// a thin class so games can be written 100% object-oriented:
//
//     this.use(new Sprite("bean"));
//     this.use(new Body({ jumpForce: 600 }));
//
// The live component state is available (and fully typed) through `.state`.

import { blend } from "../ecs/components/draw/blend";
import { circle } from "../ecs/components/draw/circle";
import { color } from "../ecs/components/draw/color";
import { drawon } from "../ecs/components/draw/drawon";
import { ellipse } from "../ecs/components/draw/ellipse";
import { fadeIn } from "../ecs/components/draw/fadeIn";
import { fill } from "../ecs/components/draw/fill";
import { mask } from "../ecs/components/draw/mask";
import { opacity } from "../ecs/components/draw/opacity";
import { outline } from "../ecs/components/draw/outline";
import { particles } from "../ecs/components/draw/particles";
import { picture } from "../ecs/components/draw/picture";
import { polygon } from "../ecs/components/draw/polygon";
import { rect } from "../ecs/components/draw/rect";
import { shader } from "../ecs/components/draw/shader";
import { sprite } from "../ecs/components/draw/sprite";
import { text } from "../ecs/components/draw/text";
import { uvquad } from "../ecs/components/draw/uvquad";
import { video } from "../ecs/components/draw/video";
import { agent } from "../ecs/components/level/agent";
import { level } from "../ecs/components/level/level";
import { pathfinder } from "../ecs/components/level/pathfinder";
import { patrol } from "../ecs/components/level/patrol";
import { sentry } from "../ecs/components/level/sentry";
import { tile } from "../ecs/components/level/tile";
import { animate } from "../ecs/components/misc/animate";
import { fakeMouse } from "../ecs/components/misc/fakeMouse";
import { health } from "../ecs/components/misc/health";
import { lifespan } from "../ecs/components/misc/lifespan";
import { named } from "../ecs/components/misc/named";
import { state } from "../ecs/components/misc/state";
import { stay } from "../ecs/components/misc/stay";
import { textInput } from "../ecs/components/misc/textInput";
import { timer } from "../ecs/components/misc/timer";
import { area } from "../ecs/components/physics/area";
import { body } from "../ecs/components/physics/body";
import { doubleJump } from "../ecs/components/physics/doubleJump";
import {
    areaEffector,
    buoyancyEffector,
    constantForce,
    platformEffector,
    pointEffector,
    surfaceEffector,
} from "../ecs/components/physics/effectors";
import { anchor } from "../ecs/components/transform/anchor";
import { fixed } from "../ecs/components/transform/fixed";
import { follow } from "../ecs/components/transform/follow";
import { layer } from "../ecs/components/transform/layer";
import { move } from "../ecs/components/transform/move";
import { offscreen } from "../ecs/components/transform/offscreen";
import { pos } from "../ecs/components/transform/pos";
import { rotate } from "../ecs/components/transform/rotate";
import { scale } from "../ecs/components/transform/scale";
import { skew } from "../ecs/components/transform/skew";
import { z } from "../ecs/components/transform/z";
import type { Vec2 } from "../math/Vec2";
import type { Comp, GameObj } from "../types";
import type { GameObject } from "./GameObject";

/**
 * Base class for all class-based components.
 *
 * A `Component` wraps an engine component definition. After the component is
 * attached to a {@link GameObject} with `use()`, `state` is the live,
 * fully-typed component state.
 *
 * Custom components can extend this class directly by passing a component
 * definition object to `super()`.
 *
 * @group Components
 */
export class Component<C extends Comp = Comp> {
    /**
     * The underlying component state. Live once attached to an object.
     */
    readonly state: C;

    constructor(state: C) {
        this.state = state;
    }

    /** The component id (e.g. `"sprite"`), if any. */
    get id(): string | undefined {
        return this.state.id;
    }
}

const asRaw = (obj: GameObject | GameObj): GameObj =>
    "raw" in obj ? (obj as GameObject).raw : obj as GameObj;

// #region Transform components

/** Position. Usually added implicitly by setting `obj.pos`. @group Components */
export class Pos extends Component<ReturnType<typeof pos>> {
    constructor(...args: Parameters<typeof pos>) {
        super(pos(...args));
    }
}

/** Rotation, in degrees. @group Components */
export class Rotate extends Component<ReturnType<typeof rotate>> {
    constructor(...args: Parameters<typeof rotate>) {
        super(rotate(...args));
    }
}

/** Scale. @group Components */
export class Scale extends Component<ReturnType<typeof scale>> {
    constructor(...args: Parameters<typeof scale>) {
        super(scale(...args));
    }
}

/** Skew. @group Components */
export class Skew extends Component<ReturnType<typeof skew>> {
    constructor(...args: Parameters<typeof skew>) {
        super(skew(...args));
    }
}

/** Render anchor point ("topleft", "center", or a Vec2). @group Components */
export class AnchorComp extends Component<ReturnType<typeof anchor>> {
    constructor(...args: Parameters<typeof anchor>) {
        super(anchor(...args));
    }
}

/** Depth (draw order) within a layer. @group Components */
export class Z extends Component<ReturnType<typeof z>> {
    constructor(...args: Parameters<typeof z>) {
        super(z(...args));
    }
}

/** Render layer. @group Components */
export class Layer extends Component<ReturnType<typeof layer>> {
    constructor(...args: Parameters<typeof layer>) {
        super(layer(...args));
    }
}

/** Unaffected by camera. @group Components */
export class Fixed extends Component<ReturnType<typeof fixed>> {
    constructor(...args: Parameters<typeof fixed>) {
        super(fixed(...args));
    }
}

/** Follow another object's position. @group Components */
export class Follow extends Component<ReturnType<typeof follow>> {
    constructor(obj: GameObject | GameObj, offset?: Vec2) {
        super(follow(asRaw(obj), offset));
    }
}

/** Move in a direction at a speed, every frame. @group Components */
export class Move extends Component<ReturnType<typeof move>> {
    constructor(...args: Parameters<typeof move>) {
        super(move(...args));
    }
}

/** React to going off-screen (hide, pause or destroy). @group Components */
export class Offscreen extends Component<ReturnType<typeof offscreen>> {
    constructor(...args: Parameters<typeof offscreen>) {
        super(offscreen(...args));
    }
}

// #endregion

// #region Draw components

/** Render a sprite. @group Components */
export class Sprite extends Component<ReturnType<typeof sprite>> {
    constructor(...args: Parameters<typeof sprite>) {
        super(sprite(...args));
    }
}

/** Render text. @group Components */
export class Text extends Component<ReturnType<typeof text>> {
    constructor(...args: Parameters<typeof text>) {
        super(text(...args));
    }
}

/** Render a rectangle. @group Components */
export class Rect extends Component<ReturnType<typeof rect>> {
    constructor(...args: Parameters<typeof rect>) {
        super(rect(...args));
    }
}

/** Render a circle. @group Components */
export class Circle extends Component<ReturnType<typeof circle>> {
    constructor(...args: Parameters<typeof circle>) {
        super(circle(...args));
    }
}

/** Render an ellipse. @group Components */
export class Ellipse extends Component<ReturnType<typeof ellipse>> {
    constructor(...args: Parameters<typeof ellipse>) {
        super(ellipse(...args));
    }
}

/** Render a polygon. @group Components */
export class Polygon extends Component<ReturnType<typeof polygon>> {
    constructor(...args: Parameters<typeof polygon>) {
        super(polygon(...args));
    }
}

/** Render a textured quad. @group Components */
export class UVQuad extends Component<ReturnType<typeof uvquad>> {
    constructor(...args: Parameters<typeof uvquad>) {
        super(uvquad(...args));
    }
}

/** Render a video. @group Components */
export class Video extends Component<ReturnType<typeof video>> {
    constructor(...args: Parameters<typeof video>) {
        super(video(...args));
    }
}

/** Render a prerecorded Picture. @group Components */
export class PictureComp extends Component<ReturnType<typeof picture>> {
    constructor(...args: Parameters<typeof picture>) {
        super(picture(...args));
    }
}

/** Tint the object. Usually added implicitly by setting `obj.color`. @group Components */
export class ColorComp extends Component<ReturnType<typeof color>> {
    constructor(...args: Parameters<typeof color>) {
        super(color(...args));
    }
}

/** Opacity. Usually added implicitly by setting `obj.opacity`. @group Components */
export class Opacity extends Component<ReturnType<typeof opacity>> {
    constructor(...args: Parameters<typeof opacity>) {
        super(opacity(...args));
    }
}

/** Outline for shape components. @group Components */
export class OutlineComp extends Component<ReturnType<typeof outline>> {
    constructor(...args: Parameters<typeof outline>) {
        super(outline(...args));
    }
}

/** Custom shader. @group Components */
export class ShaderComp extends Component<ReturnType<typeof shader>> {
    constructor(...args: Parameters<typeof shader>) {
        super(shader(...args));
    }
}

/** Blend mode. @group Components */
export class Blend extends Component<ReturnType<typeof blend>> {
    constructor(...args: Parameters<typeof blend>) {
        super(blend(...args));
    }
}

/** Mask children rendering. @group Components */
export class MaskComp extends Component<ReturnType<typeof mask>> {
    constructor(...args: Parameters<typeof mask>) {
        super(mask(...args));
    }
}

/** Fade in when the object is added. @group Components */
export class FadeIn extends Component<ReturnType<typeof fadeIn>> {
    constructor(...args: Parameters<typeof fadeIn>) {
        super(fadeIn(...args));
    }
}

/** Fill or don't fill shape components. @group Components */
export class Fill extends Component<ReturnType<typeof fill>> {
    constructor(...args: Parameters<typeof fill>) {
        super(fill(...args));
    }
}

/** Draw on a custom render target. @group Components */
export class DrawOn extends Component<ReturnType<typeof drawon>> {
    constructor(...args: Parameters<typeof drawon>) {
        super(drawon(...args));
    }
}

/** Particle emitter. @group Components */
export class Particles extends Component<ReturnType<typeof particles>> {
    constructor(...args: Parameters<typeof particles>) {
        super(particles(...args));
    }
}

// #endregion

// #region Physics components

/** Collider area; enables collision and mouse events. @group Components */
export class Area extends Component<ReturnType<typeof area>> {
    constructor(...args: Parameters<typeof area>) {
        super(area(...args));
    }
}

/** Physical body that responds to gravity and collisions. @group Components */
export class Body extends Component<ReturnType<typeof body>> {
    constructor(...args: Parameters<typeof body>) {
        super(body(...args));
    }
}

/** Multiple jumps support for Body. @group Components */
export class DoubleJump extends Component<ReturnType<typeof doubleJump>> {
    constructor(...args: Parameters<typeof doubleJump>) {
        super(doubleJump(...args));
    }
}

/** Surface (conveyor-like) effector. @group Components */
export class SurfaceEffector
    extends Component<ReturnType<typeof surfaceEffector>>
{
    constructor(...args: Parameters<typeof surfaceEffector>) {
        super(surfaceEffector(...args));
    }
}

/** Force-field area effector. @group Components */
export class AreaEffector extends Component<ReturnType<typeof areaEffector>> {
    constructor(...args: Parameters<typeof areaEffector>) {
        super(areaEffector(...args));
    }
}

/** Attract/repulse from a point. @group Components */
export class PointEffector extends Component<ReturnType<typeof pointEffector>> {
    constructor(...args: Parameters<typeof pointEffector>) {
        super(pointEffector(...args));
    }
}

/** Constant force applied every frame. @group Components */
export class ConstantForce extends Component<ReturnType<typeof constantForce>> {
    constructor(...args: Parameters<typeof constantForce>) {
        super(constantForce(...args));
    }
}

/** One-way platform effector. @group Components */
export class PlatformEffector
    extends Component<ReturnType<typeof platformEffector>>
{
    constructor(...args: Parameters<typeof platformEffector>) {
        super(platformEffector(...args));
    }
}

/** Buoyancy (fluid) effector. @group Components */
export class BuoyancyEffector
    extends Component<ReturnType<typeof buoyancyEffector>>
{
    constructor(...args: Parameters<typeof buoyancyEffector>) {
        super(buoyancyEffector(...args));
    }
}

// #endregion

// #region Misc components

/** Health points with hurt/heal events. @group Components */
export class Health extends Component<ReturnType<typeof health>> {
    constructor(...args: Parameters<typeof health>) {
        super(health(...args));
    }
}

/** Destroy the object after a time. @group Components */
export class Lifespan extends Component<ReturnType<typeof lifespan>> {
    constructor(...args: Parameters<typeof lifespan>) {
        super(lifespan(...args));
    }
}

/** A name for the object. @group Components */
export class Named extends Component<ReturnType<typeof named>> {
    constructor(...args: Parameters<typeof named>) {
        super(named(...args));
    }
}

/** Finite state machine. @group Components */
export class State<T extends string> extends Component<
    ReturnType<typeof state<T>>
> {
    constructor(...args: Parameters<typeof state<T>>) {
        super(state(...args));
    }
}

/** Persist the object between scenes. @group Components */
export class Stay extends Component<ReturnType<typeof stay>> {
    constructor(...args: Parameters<typeof stay>) {
        super(stay(...args));
    }
}

/** Editable text input (requires Text). @group Components */
export class TextInput extends Component<ReturnType<typeof textInput>> {
    constructor(...args: Parameters<typeof textInput>) {
        super(textInput(...args));
    }
}

/** wait() / loop() / tween() bound to the object's lifetime. @group Components */
export class Timer extends Component<ReturnType<typeof timer>> {
    constructor(...args: Parameters<typeof timer>) {
        super(timer(...args));
    }
}

/** Keyframe animation of object properties. @group Components */
export class Animate extends Component<ReturnType<typeof animate>> {
    constructor(...args: Parameters<typeof animate>) {
        super(animate(...args));
    }
}

/** A virtual mouse cursor. @group Components */
export class FakeMouse extends Component<ReturnType<typeof fakeMouse>> {
    constructor(...args: Parameters<typeof fakeMouse>) {
        super(fakeMouse(...args));
    }
}

// #endregion

// #region Level components

/** A tilemap level built from a string map. @group Components */
export class Level extends Component<ReturnType<typeof level>> {
    constructor(...args: Parameters<typeof level>) {
        super(level(...args));
    }
}

/** A tile inside a Level. @group Components */
export class Tile extends Component<ReturnType<typeof tile>> {
    constructor(...args: Parameters<typeof tile>) {
        super(tile(...args));
    }
}

/** An agent that navigates a Level. @group Components */
export class Agent extends Component<ReturnType<typeof agent>> {
    constructor(...args: Parameters<typeof agent>) {
        super(agent(...args));
    }
}

/** Patrol along waypoints. @group Components */
export class Patrol extends Component<ReturnType<typeof patrol>> {
    constructor(...args: Parameters<typeof patrol>) {
        super(patrol(...args));
    }
}

/** Detect objects in line of sight. @group Components */
export class Sentry extends Component<ReturnType<typeof sentry>> {
    constructor(...args: Parameters<typeof sentry>) {
        super(sentry(...args));
    }
}

/** Pathfinding on a Level. @group Components */
export class Pathfinder extends Component<ReturnType<typeof pathfinder>> {
    constructor(...args: Parameters<typeof pathfinder>) {
        super(pathfinder(...args));
    }
}

// #endregion
