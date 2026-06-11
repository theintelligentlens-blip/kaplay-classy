import { gjkShapeIntersection } from "../../math/gjk";
import { Rect } from "../../math/math";
import { minkowskiRectShapeIntersection } from "../../math/minkowski";
import { satShapeIntersection } from "../../math/sat";
import type { BroadPhaseAlgorithm } from "../../math/spatial";
import {
    SweepAndPruneHorizontal,
    SweepAndPruneVertical,
} from "../../math/spatial/sweepandprune";
import { _k } from "../../shared";
import type { GameObj } from "../../types";
import { type AreaComp, usesArea } from "../components/physics/area";
import { Collision } from "./Collision";
/**
 * The broadphase algorithm: the built-in sweep-and-prune ("sap" horizontal,
 * "sapv" vertical), or a factory returning a custom implementation — like
 * {@link quadtreeBroadphase} or {@link hashGridBroadphase}, which are only
 * bundled when imported.
 */
export type BroadPhaseType = "sap" | "sapv" | (() => BroadPhaseAlgorithm);
export type NarrowPhaseType = "gjk" | "sat" | "box";

export const createCollisionSystem = (
    { broad = "sap", narrow = "gjk" }: {
        broad?: BroadPhaseType;
        narrow?: NarrowPhaseType;
    } = {},
) => {
    const broadPhaseIntersection: BroadPhaseAlgorithm =
        typeof broad === "function"
            ? broad()
            : broad === "sapv"
            ? new SweepAndPruneVertical()
            : new SweepAndPruneHorizontal();
    const narrowPhaseIntersection = narrow === "gjk"
        ? gjkShapeIntersection
        : narrow === "sat"
        ? satShapeIntersection
        : narrow === "box"
        ? minkowskiRectShapeIntersection
        : gjkShapeIntersection;

    function narrowPhase(
        obj: GameObj<AreaComp>,
        other: GameObj<AreaComp>,
    ): boolean {
        for (const tag of obj.collisionIgnore) {
            if (other.is(tag)) {
                return false;
            }
        }
        for (const tag of other.collisionIgnore) {
            if (obj.is(tag)) {
                return false;
            }
        }
        const res = narrowPhaseIntersection(obj.worldArea(), other.worldArea());
        if (res) {
            const col1 = new Collision(
                obj,
                other,
                res.normal,
                res.distance,
            );
            obj.trigger("collideUpdate", other, col1);
            const col2 = col1.reverse();
            // resolution only has to happen once
            col2.resolved = col1.resolved;
            other.trigger("collideUpdate", obj, col2);
        }
        return true;
    }

    let broadInit = false;

    function broadPhase() {
        if (!broadInit) {
            broadInit = true;
            _k.appScope.onAdd(obj => {
                if (obj.has("area")) {
                    broadPhaseIntersection.add(obj as GameObj<AreaComp>);
                }
            });
            _k.appScope.onDestroy(obj => {
                broadPhaseIntersection.remove(obj as GameObj<AreaComp>);
            });
            _k.appScope.onUse((obj, id) => {
                if (id === "area") {
                    broadPhaseIntersection.add(obj as GameObj<AreaComp>);
                }
            });
            _k.appScope.onUnuse((obj, id) => {
                if (id === "area") {
                    broadPhaseIntersection.remove(obj as GameObj<AreaComp>);
                }
            });

            for (const obj of _k.game.root.get("*", { recursive: true })) {
                if (obj.has("area")) {
                    broadPhaseIntersection.add(obj as GameObj<AreaComp>);
                }
            }
        }

        broadPhaseIntersection.update();
        broadPhaseIntersection.iterPairs(narrowPhase);
    }

    function checkFrame() {
        if (!usesArea()) {
            return;
        }

        return broadPhase();
    }

    function retrieve(
        rect: Rect,
        retrieveCb: (obj: GameObj<AreaComp>) => void,
    ) {
        broadPhaseIntersection.retrieve(rect, retrieveCb);
    }

    return {
        checkFrame,
        retrieve,
    };
};
