// The engine is what KAPLAY needs for running and proccesing all it's stuff

import { initApp } from "../app/app";
import { initAssets } from "../assets/asset";
import { initAudio } from "../audio/audio";
import { createDebug } from "../debug/debug";
import { createScopeHandlers } from "../events/scopeHandlers";
import {
    attachScopeHandlersToGameObjRaw,
    createAppScope,
    createSceneScope,
} from "../events/scopes";
import { createGame } from "../game/game";
import { createCanvas } from "../gfx/canvas";
import { initGfx } from "../gfx/gfx";
import { initAppGfx } from "../gfx/gfxApp";
import type { KAPLAYOpt } from "../types";
import { startEngineLoop } from "./engineLoop";
import { createFontCache } from "./fontCache";
import { createFrameRenderer } from "./frameRendering";

export type Engine = ReturnType<typeof createEngine>;

/**
 * Creates all necessary contexts and variables for running a KAPLAY instance.
 *
 * @ignore
 *
 * @param gopt - Global options for create the engine.
 *
 * @returns Engine.
 */
export const createEngine = (gopt: KAPLAYOpt) => {
    // Default options
    window.kaplayjs_assetsAliases ??= {};

    const opt = Object.assign(
        {
            scale: 1,
            spriteAtlasPadding: 2,
            defaultLifetimeScope: "scene" as "scene" | "app",
        } satisfies KAPLAYOpt,
        gopt,
    );

    const canvas = createCanvas(opt);
    const { fontCacheC2d, fontCacheCanvas } = createFontCache();
    const app = initApp({ canvas, ...gopt });
    const gameHandlers = createScopeHandlers(app);
    const sceneScope = createSceneScope(gameHandlers);
    const appScope = createAppScope(gameHandlers);
    const defaultScope = gopt.defaultLifetimeScope === "app"
        ? appScope
        : sceneScope;
    attachScopeHandlersToGameObjRaw(gameHandlers);

    // TODO: Probably we should move this to initGfx
    const canvasContext = app.canvas
        .getContext("webgl", {
            antialias: true,
            depth: true,
            stencil: true,
            alpha: true,
            preserveDrawingBuffer: true,
        });

    if (!canvasContext) throw new Error("WebGL not supported");

    const gl = canvasContext;

    // TODO: Investigate correctly what's the different between GFX and AppGFX and reduce to 1 method
    const gfx = initGfx(gl, opt);
    const appGfx = initAppGfx(gfx, opt);
    const assets = initAssets(gfx, opt, appGfx);
    const audio = initAudio();
    const game = createGame(opt.rng);

    // Frame rendering
    const frameRenderer = createFrameRenderer(
        app,
        appGfx,
        game,
        opt.pixelDensity ?? 1,
    );

    // Debug mode
    const debug = createDebug(opt, app, appGfx, audio, game, frameRenderer);

    return {
        globalOpt: opt,
        canvas,
        app,
        ggl: gfx,
        gfx: appGfx,
        audio,
        assets,
        frameRenderer,
        fontCacheC2d,
        fontCacheCanvas,
        game,
        debug,
        gc: [] as (() => void)[],
        sceneScope,
        appScope,
        defaultScope,
        startLoop() {
            startEngineLoop(
                app,
                game,
                assets,
                opt,
                frameRenderer,
                debug,
            );
        },
    };
};
