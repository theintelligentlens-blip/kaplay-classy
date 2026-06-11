import { beforeAll, describe, expect, test } from "vitest";

describe("Game initialization", () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "creating a Game should not leak the API into the global scope",
        async () => {
            const leaked = await page.evaluate(() => {
                new kaplay.Game();

                return [
                    // @ts-ignore
                    typeof window["add"],
                    // @ts-ignore
                    typeof window["vec2"],
                    // @ts-ignore
                    typeof window["onUpdate"],
                ];
            });

            expect(leaked).toEqual(["undefined", "undefined", "undefined"]);
        },
        20000,
    );

    test(
        "Game.current should point to the running game",
        async () => {
            const isCurrent = await page.evaluate(() => {
                const game = new kaplay.Game();
                return kaplay.Game.current === game;
            });

            expect(isCurrent).toBe(true);
        },
        20000,
    );

    test(
        "component state should be reachable directly on a GameObject",
        async () => {
            const hp = await page.evaluate(() => {
                const game = new kaplay.Game();
                const obj = game.add([new kaplay.Health(8)]);
                obj.hp--;
                return obj.hp;
            });

            expect(hp).toBe(7);
        },
        20000,
    );

    test(
        "GameObject subclasses should run lifecycle methods",
        async () => {
            const result = await page.evaluate(() => {
                const game = new kaplay.Game();

                let added = false;

                class Player extends kaplay.GameObject {
                    speed = 240;

                    onAdd() {
                        added = true;
                    }
                }

                const player = game.add(new Player());

                return {
                    added,
                    speed: player.speed,
                    exists: player.exists(),
                };
            });

            expect(result).toEqual({ added: true, speed: 240, exists: true });
        },
        20000,
    );

    test(
        "setting pos should auto-attach the Pos component",
        async () => {
            const result = await page.evaluate(() => {
                const game = new kaplay.Game();
                const obj = game.add([]);
                obj.pos = new kaplay.Vec2(42, 24);
                return { x: obj.pos.x, y: obj.pos.y, has: obj.has("pos") };
            });

            expect(result).toEqual({ x: 42, y: 24, has: true });
        },
        20000,
    );
});
