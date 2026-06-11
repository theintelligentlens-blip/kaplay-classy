// @ts-check
// @test
// The smallest KAPLAY Classy game: a game, a sprite, some movement.

const { Game, Sprite, Area, Rotate, burp } = kaplay;

const game = new Game({ background: "#6d80fa" });

game.assets.loadSprite("bean", "/sprites/bean.png");

// Add an object from a plain component list
const bean = game.add([
    new Sprite("bean"),
    new Area(),
    new Rotate(0),
]);

// Position can be set directly — the Pos component is attached automatically
bean.pos = game.center;

const SPEED = 320;

// Move with arrow keys. `move()` comes from the Pos component.
game.input.onKeyDown("left", () => bean.move(-SPEED, 0));
game.input.onKeyDown("right", () => bean.move(SPEED, 0));
game.input.onKeyDown("up", () => bean.move(0, -SPEED));
game.input.onKeyDown("down", () => bean.move(0, SPEED));

// Spin it while space is held
game.input.onKeyDown("space", () => {
    bean.angle += 120 * game.dt;
});

game.onClick(() => burp());
