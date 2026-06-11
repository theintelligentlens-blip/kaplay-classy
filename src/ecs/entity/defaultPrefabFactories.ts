// Registers the deserialization factories for the built-in components.
//
// This is only imported by the prefab module and runs on first
// deserialization, so games that don't use prefabs don't bundle every
// component the factories reference.

import { blendFactory } from "../components/draw/blend";
import { circleFactory } from "../components/draw/circle";
import { colorFactory } from "../components/draw/color";
import { ellipseFactory } from "../components/draw/ellipse";
import { maskFactory } from "../components/draw/mask";
import { opacityFactory } from "../components/draw/opacity";
import { outlineFactory } from "../components/draw/outline";
import { rectFactory } from "../components/draw/rect";
import { spriteFactory } from "../components/draw/sprite";
import { textFactory } from "../components/draw/text";
import { anchorFactory } from "../components/transform/anchor";
import { fixedFactory } from "../components/transform/fixed";
import { moveFactory } from "../components/transform/move";
import { posFactory } from "../components/transform/pos";
import { rotateFactory } from "../components/transform/rotate";
import { scaleFactory } from "../components/transform/scale";
import { zFactory } from "../components/transform/z";
import { registerPrefabFactory } from "./prefab";

let registered = false;

export function registerDefaultPrefabFactories() {
    if (registered) return;
    registered = true;

    // Transform serialization
    registerPrefabFactory("anchor", anchorFactory);
    registerPrefabFactory("fixed", fixedFactory);
    // `follow()` missing, we should figure a way to serialize an object reference (probably use named())
    // `layer()` missing, needs investigation
    registerPrefabFactory("move", moveFactory);
    // `offscreen()` missing
    registerPrefabFactory("pos", posFactory);
    registerPrefabFactory("rotate", rotateFactory);
    registerPrefabFactory("scale", scaleFactory);
    registerPrefabFactory("z", zFactory);

    // Draw serialization
    registerPrefabFactory("blend", blendFactory);
    registerPrefabFactory("circle", circleFactory);
    registerPrefabFactory("color", colorFactory);
    // `drawon()` missing
    registerPrefabFactory("ellipse", ellipseFactory);
    // `fadeIn()` missing
    registerPrefabFactory("mask", maskFactory);
    registerPrefabFactory("opacity", opacityFactory);
    registerPrefabFactory("outline", outlineFactory);
    // `particles()` missing
    // `picture()` missing
    registerPrefabFactory("rect", rectFactory);
    registerPrefabFactory("sprite", spriteFactory);
    registerPrefabFactory("text", textFactory);
    // `uvquad()` missing
    // `video()` missing
}
