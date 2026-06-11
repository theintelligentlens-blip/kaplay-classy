import { loadSprite } from "../../../assets/sprite";
import boomSpriteSrc from "../../../data/assets/boom.png";
import kaSpriteSrc from "../../../data/assets/ka.png";
import type { Vec2 } from "../../../math/Vec2";
import { _k } from "../../../shared";
import type { CompList, GameObj } from "../../../types";
import { sprite } from "../../components/draw/sprite";
import { boom } from "../../components/misc/boom";
import { stay } from "../../components/misc/stay";
import { timer } from "../../components/misc/timer";
import { anchor } from "../../components/transform/anchor";
import { pos } from "../../components/transform/pos";
import { scale } from "../../components/transform/scale";

/**
 * @group Game Obj
 * @subgroup Types
 */
export interface BoomOpt {
    /**
     * Animation speed.
     */
    speed?: number;
    /**
     * Scale.
     */
    scale?: number;
    /**
     * Additional components.
     *
     * @since v3000.0
     */
    comps?: CompList<any>;
}

export function addKaboom(p: Vec2, opt: BoomOpt = {}): GameObj {
    // The explosion sprites are only bundled (and loaded) if addKaboom is used
    if (!_k.game.defaultAssets.boom) {
        _k.game.defaultAssets.boom = loadSprite(null, boomSpriteSrc);
    }
    if (!_k.game.defaultAssets.ka) {
        _k.game.defaultAssets.ka = loadSprite(null, kaSpriteSrc);
    }

    const kaboom = _k.game.root.add([
        pos(p),
        stay(),
    ]);

    const speed = (opt.speed || 1) * 5;
    const s = opt.scale || 1;

    kaboom.add([
        sprite(_k.game.defaultAssets.boom),
        scale(0),
        anchor("center"),
        boom(speed, s),
        ...opt.comps ?? [],
    ]);

    const ka = kaboom.add([
        sprite(_k.game.defaultAssets.ka),
        scale(0),
        anchor("center"),
        timer(),
        ...opt.comps ?? [],
    ]);

    ka.wait(0.4 / speed, () => ka.use(boom(speed, s)));
    ka.onDestroy(() => kaboom.destroy());

    return kaboom;
}
