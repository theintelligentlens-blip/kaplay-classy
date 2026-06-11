// Immediate-mode drawing, for use inside `draw()` overrides and `onDraw`
// callbacks:
//
//     draw() {
//         Draw.rect({ width: 40, height: 40, pos: vec2(0, 0) });
//     }

import { drawBezier } from "../gfx/draw/drawBezier";
import { drawCanvas } from "../gfx/draw/drawCanvas";
import { drawCircle } from "../gfx/draw/drawCircle";
import { drawCurve } from "../gfx/draw/drawCurve";
import { drawEllipse } from "../gfx/draw/drawEllipse";
import { drawFormattedText } from "../gfx/draw/drawFormattedText";
import { drawLine, drawLines } from "../gfx/draw/drawLine";
import { drawMasked } from "../gfx/draw/drawMasked";
import { drawPolygon } from "../gfx/draw/drawPolygon";
import { drawRect } from "../gfx/draw/drawRect";
import { drawSprite } from "../gfx/draw/drawSprite";
import { drawSubtracted } from "../gfx/draw/drawSubtracted";
import { drawText } from "../gfx/draw/drawText";
import { drawTriangle } from "../gfx/draw/drawTriangle";
import { drawUVQuad } from "../gfx/draw/drawUVQuad";
import { compileStyledText, formatText } from "../gfx/formatText";
import {
    loadMatrix,
    multRotate,
    multScaleV,
    multTranslateV,
    popTransform,
    pushTransform,
    usePostEffect,
} from "../gfx/stack";

/**
 * Immediate-mode drawing functions, usable inside `draw()` overrides and
 * `onDraw()` callbacks.
 *
 * @group Draw
 */
export class Draw {
    private constructor() {}

    static readonly sprite = drawSprite;
    static readonly text = drawText;
    static readonly formattedText = drawFormattedText;
    static readonly rect = drawRect;
    static readonly line = drawLine;
    static readonly lines = drawLines;
    static readonly triangle = drawTriangle;
    static readonly circle = drawCircle;
    static readonly ellipse = drawEllipse;
    static readonly polygon = drawPolygon;
    static readonly uvquad = drawUVQuad;
    static readonly curve = drawCurve;
    static readonly bezier = drawBezier;
    static readonly canvas = drawCanvas;
    static readonly masked = drawMasked;
    static readonly subtracted = drawSubtracted;

    static readonly formatText = formatText;
    static readonly compileStyledText = compileStyledText;

    /** Push the current transform onto the stack. */
    static readonly pushTransform = pushTransform;
    /** Pop the last pushed transform off the stack. */
    static readonly popTransform = popTransform;
    /** Translate the current transform. */
    static readonly pushTranslate = multTranslateV;
    /** Scale the current transform. */
    static readonly pushScale = multScaleV;
    /** Rotate the current transform. */
    static readonly pushRotate = multRotate;
    /** Load a transform matrix. */
    static readonly pushMatrix = loadMatrix;
    /** Apply a post-processing shader to the whole screen. */
    static readonly usePostEffect = usePostEffect;
}
