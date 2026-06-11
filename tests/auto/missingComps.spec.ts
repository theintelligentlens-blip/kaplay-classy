import { beforeAll, describe, expect, test } from "vitest";

// [subject] should [behavior when condition]

describe("Component validation in add()", async () => {
    beforeAll(async () => {
        await page.addScriptTag({ path: "dist/kaplay.js" });
    });

    test(
        "add() should auto-attach Pos when a Body is passed without it",
        async () => {
            const result = await page.evaluate(() => {
                const game = new kaplay.Game();
                const obj = game.add([new kaplay.Body()]);
                return { hasPos: obj.has("pos"), hasBody: obj.has("body") };
            });

            expect(result).toEqual({ hasPos: true, hasBody: true });
        },
        20000,
    );

    test(
        "add() should throw an error when a non-injectable dependency is missing",
        async () => {
            async function useDoubleJumpWithoutBody() {
                return page.evaluate(() => {
                    const game = new kaplay.Game();

                    return new Promise((res, rej) => {
                        game.onError((e) => {
                            rej(e.message);
                        });

                        game.add([new kaplay.DoubleJump()]);
                    });
                });
            }

            await expect(useDoubleJumpWithoutBody).rejects.toThrow(/requires/);
        },
        20000,
    );
});
