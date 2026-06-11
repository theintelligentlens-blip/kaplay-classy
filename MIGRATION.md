# Migrating from KAPLAY to KAPLAY Classy

KAPLAY Classy keeps the engine you know — same renderer, physics, components and
behavior — but replaces the global, function-based API with classes. This guide
maps every classic pattern to its classy equivalent.

## The big picture

| Classic KAPLAY                                    | KAPLAY Classy                                             |
| ------------------------------------------------- | --------------------------------------------------------- |
| `kaplay({ ... })`                                 | `new Game({ ... })`                                       |
| Global functions (`add`, `vec2`, `onKeyPress`...) | Members of `game`, or named imports                       |
| Component factories (`sprite()`, `body()`)        | Component classes (`new Sprite()`, `new Body()`)          |
| `scene("name", fn)` + `go("name")`                | `Scene` subclasses + `game.scenes.go(SceneClass)`         |
| `global: false` option                            | Gone — there are no globals, ever                         |
| Plugins (`plugins: [...]`, `plug()`)              | Removed (the flat context they extended no longer exists) |
| `kaplayTypes()` / `types` option                  | Replaced by real inference from your classes              |

## Starting a game

```js
// before
kaplay({ background: "#6d80fa", width: 640, height: 480 });

// after
import { Game } from "kaplay-classy";
const game = new Game({ background: "#6d80fa", width: 640, height: 480 });
```

`Game`'s options are the same `KAPLAYOpt` you already know, minus `global`,
`plugins`, `types` and `burp`.

## Loading assets

Every `loadXxx()` global lives on `game.assets` now:

```js
// before
loadSprite("bean", "sprites/bean.png");
loadSound("score", "sounds/score.mp3");
loadFont("unscii", "fonts/unscii.ttf");

// after
game.assets.loadSprite("bean", "sprites/bean.png");
game.assets.loadSound("score", "sounds/score.mp3");
game.assets.loadFont("unscii", "fonts/unscii.ttf");
```

`loadBean()` and `loadHappy()` are named imports (so their embedded images only
ship if you use them): `import { loadBean } from "kaplay-classy"`.

## Game objects and components

Component factories become classes. `add([...])` becomes `game.add([...])`:

```js
// before
const player = add([
    sprite("bean"),
    pos(100, 200),
    area(),
    body(),
    health(8),
    "friendly",
    { speed: 240 },
]);

// after
import { Area, Body, Health, Sprite, vec2 } from "kaplay-classy";

const player = game.add([
    new Sprite("bean"),
    new Area(),
    new Body(),
    new Health(8),
    "friendly",
    { speed: 240 },
]);
player.pos = vec2(100, 200); // Pos attaches automatically
```

Constructor arguments are identical to the old factory arguments. Tags and plain
data objects work like before. In TypeScript, the returned object is fully typed
from the parts you passed (`player.hp` is a `number`).

Or go full OOP — extend `GameObject` and override lifecycle methods instead of
registering callbacks:

```js
class Player extends GameObject {
    speed = 240;

    constructor() {
        super(new Sprite("bean"), new Area(), new Body(), new Health(8));
        this.pos = vec2(100, 200);
    }

    onAdd() {
        this.onCollide("enemy", () => this.hp--);
    }

    update() { // was: player.onUpdate(() => ...)
        if (this.pos.y > this.game.height) this.destroy();
    }
}

game.add(new Player());
```

Lifecycle methods: `onAdd()`, `update()`, `fixedUpdate()`, `draw()`,
`onDestroy()`.

### Component name changes

| Classic factory | Classy class                                                        |
| --------------- | ------------------------------------------------------------------- |
| `anchor()`      | `AnchorComp` (or set `obj.anchorPoint`)                             |
| `color()`       | `ColorComp` (or set `obj.color`)                                    |
| `mask()`        | `MaskComp`                                                          |
| `outline()`     | `OutlineComp`                                                       |
| `shader()`      | `ShaderComp`                                                        |
| `picture()`     | `PictureComp`                                                       |
| everything else | Same name, capitalized: `sprite()` → `Sprite`, `body()` → `Body`... |

`pos`, `rotate`, `scale`, `z`, `opacity`, `color` and `anchor` rarely need
explicit classes — assigning `obj.pos`, `obj.angle`, `obj.scale`, `obj.z`,
`obj.opacity`, `obj.color` or `obj.anchorPoint` attaches them automatically.

Geometry classes (used in `new Area({ shape })`, raycasts...) are exported with
a `Shape` suffix: `RectShape`, `CircleShape`, `EllipseShape`, `PolygonShape`,
`LineShape`, `PointShape`.

### Custom components

```js
// before
function wobble(strength = 24) {
    return { id: "wobble", require: ["pos"], update() {/* ... */} };
}

// after
class Wobble extends Component {
    constructor(strength = 24) {
        super({ id: "wobble", require: ["pos"], update() {/* ... */} });
    }
}
```

Raw component definition objects still work everywhere a component class does,
so existing custom components can be passed to `use()` / `add()` as-is.

## Input

Input queries and events live on `game.input`:

| Before                              | After                                          |
| ----------------------------------- | ---------------------------------------------- |
| `onKeyPress("space", fn)`           | `game.input.onKeyPress("space", fn)`           |
| `onKeyDown("left", fn)`             | `game.input.onKeyDown("left", fn)`             |
| `onMousePress(fn)`                  | `game.input.onMousePress(fn)`                  |
| `isKeyDown("left")`                 | `game.input.isKeyDown("left")`                 |
| `mousePos()`                        | `game.input.mousePos()`                        |
| `onGamepadButtonPress("south", fn)` | `game.input.onGamepadButtonPress("south", fn)` |
| `onButtonPress("jump", fn)`         | `game.input.onButtonPress("jump", fn)`         |

## Global events, timers, world

```js
// before                          // after
onUpdate("enemy", fn);             game.onUpdate("enemy", fn);
onCollide("a", "b", fn);           game.onCollide("a", "b", fn);
onClick("btn", fn);                game.onClick("btn", fn);
wait(1, fn);                       game.wait(1, fn);
loop(1, fn);                       game.loop(1, fn);
tween(...);                        game.tween(...);
width(); height(); center();       game.width; game.height; game.center;
dt(); time();                      game.dt; game.time;
setGravity(1600); getGravity();    game.gravity = 1600; game.gravity;
setBackground(...);                game.background = ...;
layers([...], "game");             game.setLayers([...], "game");
destroyAll("enemy");               game.destroyAll("enemy");
get("enemy");                      game.get("enemy");
debug.paused = true;               game.debug.paused = true;
quit();                            game.quit();
```

## Camera

| Before                   | After                                        |
| ------------------------ | -------------------------------------------- |
| `setCamPos(x, y)`        | `game.camera.pos = vec2(x, y)`               |
| `setCamScale(2)`         | `game.camera.scale = 2`                      |
| `setCamRot(45)`          | `game.camera.angle = 45`                     |
| `shake(12)`              | `game.camera.shake(12)`                      |
| `flash(WHITE, 0.5)`      | `game.camera.flash(rgb(255, 255, 255), 0.5)` |
| `toWorld(p)/toScreen(p)` | `game.camera.toWorld(p)/.toScreen(p)`        |

## Audio

| Before           | After                                           |
| ---------------- | ----------------------------------------------- |
| `play("score")`  | `game.audio.play("score")`                      |
| `setVolume(0.5)` | `game.audio.volume = 0.5`                       |
| `burp()`         | `import { burp } from "kaplay-classy"; burp();` |

## Scenes

```js
// before
scene("game", (score) => {/* ... */});
go("game", 0);

// after
class Gameplay extends Scene {
    onEnter(score) {/* this.game is available */}
    onLeave(nextScene) {/* optional */}
}
game.scenes.add(Gameplay);
game.scenes.go(Gameplay, 0); // args typechecked against onEnter()
```

`pushScene`/`popScene` → `game.scenes.push()` / `game.scenes.pop()`;
`getSceneName()` → `game.scenes.current`. Function-style scenes still work via
`game.scenes.define("name", fn)`.

## Custom drawing

The `drawXxx()` globals are static methods on the `Draw` class, used inside
`draw()` overrides or `game.onDraw()`:

```js
// before                          // after
drawRect({ width: 40, ... });      Draw.rect({ width: 40, ... });
drawSprite({ sprite: "bean" });    Draw.sprite({ sprite: "bean" });
pushTransform(); popTransform();   Draw.pushTransform(); Draw.popTransform();
usePostEffect("crt");              Draw.usePostEffect("crt");
```

## Math & utilities

`vec2`, `rgb`, `hsl2rgb`, `rand`, `randi`, `choose`, `shuffle`, `lerp`, `map`,
`wave`, `clamp`, `deg2rad`, `easings`, `Vec2`, `Color`, `Quad`, `Mat23`,
`RNG`... are all named imports with unchanged signatures:

```js
import { choose, rand, rgb, vec2, wave } from "kaplay-classy";
```

## The debug view

The on-screen inspector (F1) and `debug.log()` rendering are opt-in now:

```js
import "kaplay-classy/debug";
// or, immune to aggressive tree shaking:
import { installDebugView } from "kaplay-classy";
installDebugView();
```

The CDN/script-tag build has it preinstalled. The `game.debug` object (pause,
time scale, `log()`, fps...) is always available either way.

## Removed, with no replacement

- **Globals** (`global: true`) — import what you need instead.
- **Plugins** — extend `Game`/`GameObject`/`Component` with regular subclasses
  instead.
- **`kaplayTypes()` / the `types` option** — your scene and entity classes carry
  their own types now.
- **Burp mode** (the `burp` option) — call `burp()` yourself, you weirdo. ❤️

## Escape hatches

- `obj.raw` is the underlying engine object (`GameObj`) if you need anything the
  class API doesn't expose.
- `obj.use()` / `game.add([...])` accept raw component definition objects, so
  factory-based code can migrate gradually.
