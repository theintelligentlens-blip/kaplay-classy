// Asset loading, namespaced under `game.assets`.

import { loadAseprite } from "../assets/aseprite";
import {
    getAsset,
    load,
    loadJSON,
    loadProgress,
    loadRoot,
} from "../assets/asset";
import {
    getBitmapFont,
    loadBitmapFont,
    loadBitmapFontFromSprite,
} from "../assets/bitmapFont";
import { getFont, loadFont } from "../assets/font";
import { getShader, loadShader, loadShaderURL } from "../assets/shader";
import { getSound, loadMusic, loadSound } from "../assets/sound";
import { getSprite, loadSprite } from "../assets/sprite";
import { loadSpriteAtlas } from "../assets/spriteAtlas";
import type { Engine } from "../core/engine";
import { loadPrefab } from "../ecs/entity/prefab";
import type { ScopeHandlers } from "../events/scopeHandlers";

/**
 * Loads and retrieves game assets. Available as `game.assets`.
 *
 * @group Assets
 */
export class AssetManager {
    constructor(private readonly scope: ScopeHandlers) {}

    // #region Loading

    /** Set the URL prefix for all subsequent loads. */
    readonly loadRoot = loadRoot;
    /** Load a sprite from an image URL. */
    readonly loadSprite = loadSprite;
    /** Load multiple sprites from a single sprite atlas image. */
    readonly loadSpriteAtlas = loadSpriteAtlas;
    /** Load a sprite with animation data exported from Aseprite. */
    readonly loadAseprite = loadAseprite;
    /** Load a sound effect (fully buffered, low latency). */
    readonly loadSound = loadSound;
    /** Load a music track (streamed). */
    readonly loadMusic = loadMusic;
    /** Load a TTF/OTF/WOFF font. */
    readonly loadFont = loadFont;
    /** Load a bitmap font from an image grid. */
    readonly loadBitmapFont = loadBitmapFont;
    /** Build a bitmap font out of an already loaded sprite. */
    readonly loadBitmapFontFromSprite = loadBitmapFontFromSprite;
    /** Load a custom fragment/vertex shader from source. */
    readonly loadShader = loadShader;
    /** Load a custom shader from URLs. */
    readonly loadShaderURL = loadShaderURL;
    /** Load a JSON file. */
    readonly loadJSON = loadJSON;
    /** Load a serialized prefab. */
    readonly loadPrefab = loadPrefab;
    /** Track a custom async loading task in the loading screen. */
    readonly load = load;

    /** Loading progress of all assets, 0–1. */
    progress(): number {
        return loadProgress();
    }

    // #endregion

    // #region Retrieval

    /** Get a loaded sprite asset. */
    readonly getSprite = getSprite;
    /** Get a loaded sound asset. */
    readonly getSound = getSound;
    /** Get a loaded font asset. */
    readonly getFont = getFont;
    /** Get a loaded bitmap font asset. */
    readonly getBitmapFont = getBitmapFont;
    /** Get a loaded shader asset. */
    readonly getShader = getShader;
    /** Get a loaded user asset by name. */
    readonly getAsset = getAsset;

    // #endregion

    // #region Events

    /** Run once all loading is done (or instantly if already done). */
    get onLoad() {
        return this.scope.onLoad;
    }

    /** Run every frame while assets are loading, e.g. for loading screens. */
    get onLoading() {
        return this.scope.onLoading;
    }

    /** Run when an asset fails to load. */
    get onLoadError() {
        return this.scope.onLoadError;
    }

    // #endregion
}
