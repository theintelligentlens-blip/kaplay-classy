// @ts-check
// @test
// Class-based scenes: extend Scene, register the class, go() by class.

const { Game, Scene, GameObject, Sprite, Area, Text, AnchorComp, vec2 } =
    kaplay;

const game = new Game({ background: "#20214a" });

game.assets.loadSprite("bean", "/sprites/bean.png");
game.assets.loadSprite("apple", "/sprites/apple.png");

class Title extends Scene {
    onEnter() {
        const label = this.game.add([
            new Text("click the apples!\npress space to start", {
                align: "center",
            }),
            new AnchorComp("center"),
        ]);
        label.pos = this.game.center;

        this.game.input.onKeyPress("space", () => {
            this.game.scenes.go(Gameplay, 0);
        });
    }
}

class Apple extends GameObject {
    constructor(game) {
        super(new Sprite("apple"), new Area(), "apple");
        this.pos = vec2(
            40 + Math.random() * (game.width - 80),
            40 + Math.random() * (game.height - 80),
        );
    }
}

class Gameplay extends Scene {
    score = 0;

    onEnter(score = 0) {
        this.score = score;

        const scoreLabel = this.game.add([new Text(`score: ${this.score}`)]);
        scoreLabel.pos = vec2(16, 16);

        for (let i = 0; i < 5; i++) {
            this.game.add(new Apple(this.game));
        }

        this.game.onClick("apple", (apple) => {
            apple.destroy();
            this.score++;
            scoreLabel.text = `score: ${this.score}`;

            if (this.game.get("apple").length === 0) {
                this.game.scenes.go(Win, this.score);
            }
        });
    }

    onLeave(next) {
        console.log(`leaving gameplay for ${next}`);
    }
}

class Win extends Scene {
    onEnter(score) {
        const label = this.game.add([
            new Text(`you win!\nscore: ${score}\npress space to play again`, {
                align: "center",
            }),
            new AnchorComp("center"),
        ]);
        label.pos = this.game.center;

        this.game.input.onKeyPress("space", () => {
            this.game.scenes.go(Gameplay, 0);
        });
    }
}

game.scenes.add(Title);
game.scenes.add(Gameplay);
game.scenes.add(Win);

game.scenes.go(Title);
