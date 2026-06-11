// @ts-check
// @test
// Define entities as classes: extend GameObject, attach components in the
// constructor, and override the lifecycle methods.

const {
    Game,
    GameObject,
    Sprite,
    Area,
    Body,
    Health,
    Rect,
    Text,
    Move,
    Offscreen,
    vec2,
    rgb,
} = kaplay;

const game = new Game({ background: "#a32858" });

game.assets.loadSprite("bean", "/sprites/bean.png");
game.assets.loadSprite("ghosty", "/sprites/ghosty.png");

game.gravity = 1600;

class Player extends GameObject {
    speed = 480;

    constructor() {
        super(
            new Sprite("bean"),
            new Area(),
            new Body(),
            new Health(3),
            "friendly",
        );
        this.pos = vec2(160, 200);
    }

    onAdd() {
        // .onCollide() comes from the Area component
        this.onCollide("enemy", (enemy) => {
            // .hp comes from the Health component
            this.hp--;
            this.game.camera.shake(8);
            enemy.destroy();
        });

        this.on("death", () => {
            this.destroy();
            const gameOver = this.game.add([new Text("game over")]);
            gameOver.pos = this.game.center;
        });

        this.game.input.onKeyDown("left", () => this.move(-this.speed, 0));
        this.game.input.onKeyDown("right", () => this.move(this.speed, 0));
        this.game.input.onKeyPress("space", () => {
            // .isGrounded() and .jump() come from the Body component
            if (this.isGrounded()) this.jump();
        });
    }

    update() {
        // fell off the screen
        if (this.pos.y > this.game.height + 100) {
            this.destroy();
        }
    }
}

class Enemy extends GameObject {
    constructor(x) {
        super(
            new Sprite("ghosty"),
            new Area(),
            new Move(vec2(-1, 0), 240),
            new Offscreen({ destroy: true, distance: 80 }),
            "enemy",
        );
        this.pos = vec2(x, 480);
    }
}

class Floor extends GameObject {
    constructor() {
        super(
            new Rect(9999, 48),
            new Area(),
            new Body({ isStatic: true }),
        );
        this.pos = vec2(0, 520);
        this.color = rgb(110, 80, 100);
    }
}

game.add(new Floor());
game.add(new Player());

// spawn enemies forever
game.loop(1.2, () => {
    game.add(new Enemy(game.width + 64));
});
