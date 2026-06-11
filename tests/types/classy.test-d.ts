import { describe, expectTypeOf, test } from "vitest";
import { Game, GameObject, Health, Scene, Sprite } from "../../src/index";

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
});
