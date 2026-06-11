// @ts-check
// @test
// Custom components and custom drawing, the classy way.

const { Game, GameObject, Component, Draw, Circle, vec2, rgb, wave } = kaplay;

const game = new Game({ background: "#1f102a" });

// A custom component: extend Component and pass a component definition.
// `this` inside the definition is the game object it's attached to.
class Wobble extends Component {
    constructor(speed = 4, strength = 24) {
        super({
            id: "wobble",
            require: ["pos"],
            update() {
                this.pos.y += Math.sin(game.time * speed) * strength
                    * game.dt;
            },
        });
    }
}

class Bubble extends GameObject {
    constructor(x, hue) {
        super(new Circle(28), new Wobble(2 + hue * 4, 60));
        this.pos = vec2(x, game.center.y);
        this.color = rgb(120 + hue * 120, 90, 200);
        this.opacity = 0.8;
    }
}

for (let i = 0; i < 8; i++) {
    game.add(new Bubble(80 + i * 90, i / 8));
}

// Override draw() for fully custom rendering with the Draw class
class Pulse extends GameObject {
    constructor() {
        super();
        this.pos = game.center;
    }

    draw() {
        Draw.circle({
            pos: vec2(0, 0),
            radius: wave(40, 90, game.time * 2),
            outline: { width: 4, color: rgb(255, 255, 255) },
            fill: false,
        });
    }
}

game.add(new Pulse());
