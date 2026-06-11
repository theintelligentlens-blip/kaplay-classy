import { Asset } from "../assets/asset";
import { SoundData } from "../assets/sound";
import burpSoundSrc from "../data/assets/burp.mp3";
import { _k } from "../shared";
import { type AudioPlay, type AudioPlayOpt, play } from "./play";

// The burp sound is embedded in the bundle, but only decoded (and only
// bundled, with tree shaking) if burp() is actually used.
export function burp(opt?: AudioPlayOpt): AudioPlay {
    if (!_k.game.defaultAssets.burp) {
        _k.game.defaultAssets.burp = new Asset(
            _k.audio.ctx
                .decodeAudioData(burpSoundSrc.buffer.slice(0) as ArrayBuffer)
                .then((buf) => new SoundData(buf)),
        );
    }

    return play(_k.game.defaultAssets.burp, opt);
}
