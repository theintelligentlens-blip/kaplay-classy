# 🎩 KAPLAY Classy — The OOP Game Library for JavaScript & TypeScript

<div align="center">
  <img src="https://raw.githubusercontent.com/theintelligentlens-blip/kaplay-classy/master/kaplay-classy.png">
</div>

**KAPLAY Classy** is an **object-oriented** take on
[KAPLAY](https://github.com/kaplayjs/kaplay) — the fun-first 2D game library for
**JavaScript** and **TypeScript**. Same speed, same fun, but built around
**classes, inheritance, and strong typing** instead of free-floating global
functions.

> [!IMPORTANT]\
> KAPLAY Classy is in **early development** (based on KAPLAY `v4000` alpha). The
> OOP core is implemented and working, but the API may still change.

## 🤔 Why Classy?

Classic KAPLAY composes game objects from component functions in a global
namespace. That's great for quick prototypes, but as games grow you often want:

- 🧱 **Real classes** — extend `GameObject`, override lifecycle methods, use
  `super`, and model your game with the OOP patterns you already know.
- 🎯 **No global soup** — nothing is ever injected into `window`. Everything
  hangs off your `Game` instance: `game.assets`, `game.input`, `game.audio`,
  `game.camera`, `game.scenes`.
- 🔡 **First-class TypeScript** — components are classes with typed state, and
  `game.add(new Player())` gives you back a `Player`.
- 🧪 **Testability** — entities are classes you can construct and inspect like
  any other class.

## 🎲 Quick Overview

```js
import { Game, Sprite } from "kaplay-classy";

// Start a game
const game = new Game({
    background: "#6d80fa",
});

// Load an image
game.assets.loadSprite("bean", "https://play.kaplayjs.com/bean.png");

// Add a game object to the scene
const bean = game.add([new Sprite("bean")]);

// Position is a property — the Pos component is attached automatically
bean.pos = game.center;
```

Define your own entities by extending `GameObject` — components are typed
building blocks you pass to the constructor or attach with `use()`:

```js
import {
    Area,
    Body,
    Game,
    GameObject,
    Health,
    Rect,
    vec2,
} from "kaplay-classy";

class Player extends GameObject {
    dir = vec2(-1, 0);
    dead = false;
    speed = 240;

    constructor() {
        super(
            new Rect(40, 40), // it renders as a rectangle
            new Area(), // it has a collider
            new Body(), // it is a physical body which responds to physics
            new Health(8), // it has 8 health points
            "friendly", // tags for easy group behaviors
        );
        this.pos = vec2(100, 200); // it has a position (coordinates)
    }
}

const player = game.add(new Player());
```

Behaviors are lifecycle methods and event handlers. Component state and methods
(like `hp` from `Health` or `jump()` from `Body`) are available directly on the
object:

```js
class Player extends GameObject {
    // ...

    onAdd() {
        // .onCollide() comes from the Area component
        this.onCollide("enemy", () => {
            // .hp comes from the Health component
            this.hp--;
        });

        // move up while "w" is held down
        this.game.input.onKeyDown("w", () => {
            this.move(0, -100);
        });
    }

    // override the per-frame update
    update() {
        // check fall death
        if (this.pos.y >= this.game.height) {
            this.destroy();
        }
    }
}

// all objects tagged "enemy" move to the left
game.onUpdate("enemy", (enemy) => {
    enemy.move(-400, 0);
});
```

Scenes are classes too:

```js
import { Scene } from "kaplay-classy";

class Title extends Scene {
    onEnter() {
        this.game.input.onKeyPress("space", () => {
            this.game.scenes.go(Gameplay, 0);
        });
    }
}

class Gameplay extends Scene {
    onEnter(score) {
        this.game.add(new Player());
    }

    onLeave(nextScene) {
        console.log(`heading to ${nextScene}`);
    }
}

game.scenes.add(Title);
game.scenes.add(Gameplay);
game.scenes.go(Title);
```

And custom components extend `Component`:

```js
import { Component } from "kaplay-classy";

class Wobble extends Component {
    constructor(strength = 24) {
        super({
            id: "wobble",
            require: ["pos"],
            update() {
                this.pos.y += Math.sin(game.time * 4) * strength * game.dt;
            },
        });
    }
}

game.add([new Sprite("bean"), new Wobble()]);
```

A few naming notes:

- Component classes that would clash with a core type keep a `Comp` suffix:
  `AnchorComp`, `ColorComp`, `OutlineComp`, `MaskComp`, `ShaderComp`,
  `PictureComp`. (You rarely need `ColorComp` — setting `obj.color`,
  `obj.opacity`, `obj.pos`, `obj.angle`, `obj.scale` or `obj.z` attaches the
  matching component automatically.)
- Geometry classes are exported as `RectShape`, `CircleShape`, `EllipseShape`,
  `PolygonShape`, `LineShape` and `PointShape`, since the plain names belong to
  the drawing components.
- Immediate-mode drawing lives on the `Draw` class (`Draw.rect(...)`,
  `Draw.circle(...)`) for use inside `draw()` overrides.

Coming from classic KAPLAY? The **[migration guide](./MIGRATION.md)** maps every
old pattern to its classy equivalent.

## 🔎 TypeScript that knows your game

Objects built from component lists are statically typed — no casts, no
declarations:

```ts
const obj = game.add([new Sprite("bean"), new Health(8)]);
obj.hp--; // number ✓
obj.frame; // number ✓ (from Sprite)
obj.typo; // ✗ compile error

// same thing outside of add():
const bean = GameObject.with(new Area(), new Body());
bean.jump(); // ✓
```

Scene arguments are checked against the scene's `onEnter()` signature:

```ts
class Gameplay extends Scene {
    onEnter(score: number, mode: string) {}
}

game.scenes.go(Gameplay, 1, "hard"); // ✓
game.scenes.go(Gameplay); // ✗ compile error: missing args
```

## 🔬 The debug view

The on-screen inspector (F1: hitboxes, object inspection, `debug.log()`
messages) is an opt-in import, so its rendering code never ships in production
builds unless you ask for it:

```js
import "kaplay-classy/debug";
// or, immune to aggressive tree shaking:
import { installDebugView } from "kaplay-classy";
installDebugView();
```

The CDN/script-tag build has it preinstalled. `game.debug` (pause, time scale,
fps, `log()`) is always available either way.

## 🪶 Lightweight by design

The package is fully **tree-shakeable** (`"sideEffects": false`, no globals, no
import-time side effects), so with any modern bundler you only ship what you
use:

- Importing `Game` doesn't drag in every component — a minimal game (`Game` +
  `Sprite` + `Area` + `Body`) bundles to **~58 KB gzipped** instead of the full
  ~99 KB.
- Built-in assets (the `burp()` sound, `addKaboom()` explosion sprites, the
  bean, the happy font) are only bundled — and only decoded — if you actually
  import and call them.
- Optional subsystems (levels, pathfinding, AI, particles, constraints,
  video...) cost nothing unless you import their component classes.
- Alternative collision broadphases are opt-in factories: the default
  sweep-and-prune is built in; `quadtreeBroadphase()` / `hashGridBroadphase()`
  are only bundled when imported.
- Prefab deserialization factories register lazily, on first prefab use.

Check the cost of your imports anytime with `node scripts/size.mjs`.

## 🖥️ Installation

KAPLAY Classy is not published to npm yet. For now, build it from source:

```sh
git clone https://github.com/theintelligentlens-blip/kaplay-classy.git
cd kaplay-classy
pnpm install
pnpm dev # examples playground at http://localhost:4000
```

> Requires **Node.js >= 24** and [pnpm](https://pnpm.io/).

Once published, installing will look like:

```sh
npm install kaplay-classy
```

## 🗺️ Roadmap

- [x] Core `Game` class replacing the global `kaplay()` context — no globals,
      ever
- [x] `GameObject` base class with inheritance-friendly lifecycle hooks
      (`onAdd`, `update`, `fixedUpdate`, `draw`, `onDestroy`)
- [x] Components as classes (`Sprite`, `Area`, `Body`, `Health`, ...) with typed
      state and automatic dependency resolution
- [x] Scene classes (`Scene`, `game.scenes.add/go/push/pop`)
- [x] Asset, input, audio and camera managers as instance members
- [x] Tree-shakeable, side-effect-free package with lazy built-in assets
- [x] Optional debug inspector as a subpath export (`kaplay-classy/debug`)
- [x] Typed scene parameters (`go(Gameplay, ...)` checks `onEnter()`)
- [x] Stronger component typing (`game.add([...])` and `GameObject.with()`
      return statically-typed objects)
- [x] Migration guide from classic KAPLAY ([MIGRATION.md](./MIGRATION.md))
- [x] npm release — package built, verified and ready to `npm publish`

Contributions and design feedback are welcome — open an issue or a discussion!

## 📚 Resources

KAPLAY Classy shares its engine internals with KAPLAY, so the upstream docs are
the best place to learn the underlying concepts:

- [KAPLAY Official Docs](https://kaplayjs.com/docs/)
- [KAPLAYGROUND](https://play.kaplayjs.com) — try classic KAPLAY in the browser
- [KAPLAY Discord Server](https://discord.gg/aQ6RuQm3TF)

The [examples/](./examples) folder shows the classy API in action — run
`pnpm dev` to play with them.

## 🙌 Credits

KAPLAY Classy is a fork of [KAPLAY](https://github.com/kaplayjs/kaplay), created
and maintained by the
[KAPLAY Team and core contributors](https://github.com/kaplayjs/kaplay/wiki/Development-Team)
with the support of many
[other amazing contributors](https://github.com/kaplayjs/kaplay/graphs/contributors).
All engine fundamentals — rendering, physics, math, assets — come from their
excellent work.

### 🏆 Recognitions

- Thanks to [mulfok](https://twitter.com/MulfoK) for the awesome
  [mulfok32](https://lospec.com/palette-list/mulfok32) color palette, used in
  KAPLAY sprites and art
- Thanks to [Pixabay](https://pixabay.com/users/pixabay-1/) for the great
  [burp](https://pixabay.com/sound-effects/burp-104984/) sound, used in `burp()`
  function
- Thanks to [Kenney](https://kenney.nl/) for all used assets for examples
  - [Impact Sound Pack](https://kenney.nl/assets/impact-sounds)
  - [1-Bit Platformer Pack](https://kenney.nl/assets/1-bit-platformer-pack)
- Thanks to [abrudz](https://github.com/abrudz) for the amazing
  [APL386 font](https://abrudz.github.io/APL386/)
- Thanks to [Polyducks](http://polyducks.co.uk/) for the amazing
  [kitchen sink font](https://polyducks.itch.io/kitchen-sink-textmode-font) font
- Thanks to [0x72](https://0x72.itch.io/) for the amazing
  [Dungeon Tileset](https://0x72.itch.io/dungeontileset-ii)
- Thanks to @Minamotion for the `tiny` character sprite used in some of the
  tests

## 📜 License

MIT — same as upstream KAPLAY. See [LICENSE](./LICENSE).
