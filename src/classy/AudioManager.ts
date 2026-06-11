// Audio playback, namespaced under `game.audio`.

import { play } from "../audio/play";
import { getVolume, setVolume } from "../audio/volume";
import type { Engine } from "../core/engine";

/**
 * Plays sounds and controls global volume. Available as `game.audio`.
 *
 * @group Audio
 */
export class AudioManager {
    constructor(private readonly audio: Engine["audio"]) {}

    /** Play a loaded sound or music track. Returns a playback controller. */
    readonly play = play;

    /** Global volume (0–1, can go higher). */
    get volume(): number {
        return getVolume();
    }

    set volume(value: number) {
        setVolume(value);
    }

    /** The underlying WebAudio AudioContext. */
    get context(): AudioContext {
        return this.audio.ctx;
    }
}
