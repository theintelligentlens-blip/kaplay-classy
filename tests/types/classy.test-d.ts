import { describe, expectTypeOf, test } from "vitest";
import {
    Area,
    Body,
    Game,
    GameObject,
    Health,
    Scene,
    Sprite,
} from "../../src/index";

describe("Classy API type inference", () => {
    const game = new Game();

    test("Game.add() should return the same GameObject subclass", () => {
        class Player extends GameObject {}

        const player = game.add(new Player());

        expectTypeOf(player).toEqualTypeOf<Player>();
    });

    test("use() should return the component, with typed state", () => {
        class Player extends GameObject {
            health = this.use(new Health(8));
        }

        const player = new Player();

        expectTypeOf(player.health).toEqualTypeOf<Health>();
        expectTypeOf(player.health.state.hp).toEqualTypeOf<number>();
    });

    test("component state should be typed", () => {
        const sprite = new Sprite("bean");

        expectTypeOf(sprite.state.frame).toEqualTypeOf<number>();
        expectTypeOf(sprite.state.play).toBeFunction();
    });

    test("Scene subclasses should know their game", () => {
        class Title extends Scene {
            onEnter() {
                expectTypeOf(this.game).toEqualTypeOf<Game>();
            }
        }

        game.scenes.add(Title);
    });

    test("game.add() with a parts list should type component members", () => {
        const obj = game.add([new Sprite("bean"), new Health(8), "enemy"]);

        expectTypeOf(obj.hp).toEqualTypeOf<number>();
        expectTypeOf(obj.frame).toEqualTypeOf<number>();
        expectTypeOf(obj.destroy).toBeFunction();

        // @ts-expect-error not a member of these components
        obj.notAComponentMember;
    });

    test("GameObject.with() should type component members", () => {
        const obj = GameObject.with(new Area(), new Body());

        expectTypeOf(obj.jump).toBeFunction();
        expectTypeOf(obj.isGrounded()).toEqualTypeOf<boolean>();
    });

    test("plain data objects in parts lists should be typed", () => {
        const obj = game.add([new Sprite("bean"), { speed: 240 }]);

        expectTypeOf(obj.speed).toEqualTypeOf<number>();
    });

    test("scenes.go() should typecheck args against onEnter()", () => {
        class Gameplay extends Scene {
            onEnter(score: number, mode: string) {
                void score;
                void mode;
            }
        }

        game.scenes.add(Gameplay);
        game.scenes.go(Gameplay, 1, "hard");

        // @ts-expect-error wrong arg types
        game.scenes.go(Gameplay, "1", 2);

        // @ts-expect-error missing args
        game.scenes.go(Gameplay);

        // string ids accept anything
        game.scenes.go("Gameplay", "whatever");
    });
});
