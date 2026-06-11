import * as esbuild from "esbuild";
import fs from "fs";
import zlib from "zlib";
fs.writeFileSync(
    "/tmp/minimal-app.ts",
    `
import { Game, GameObject, Sprite, Area, Body, vec2 } from "${process.cwd()}/src/index.ts";
const game = new Game({ background: "#000" });
game.assets.loadSprite("bean", "bean.png");
class Player extends GameObject {
    constructor() { super(new Sprite("bean"), new Area(), new Body()); this.pos = vec2(0, 0); }
    update() { if (this.pos.y > game.height) this.destroy(); }
}
game.add(new Player());
game.input.onKeyPress("space", () => console.log("jump"));
`,
);
const common = {
    bundle: true,
    minify: true,
    write: false,
    metafile: true,
    loader: { ".png": "dataurl", ".glsl": "text", ".mp3": "binary" },
    define: { KAPLAY_VERSION: "\"0.0.0\"" },
    format: "esm",
};
for (
    const [label, entry] of [["FULL library ", "src/index.ts"], [
        "MINIMAL app  ",
        "/tmp/minimal-app.ts",
    ]]
) {
    const r = await esbuild.build({
        ...common,
        entryPoints: [entry],
        outfile: "out.mjs",
    });
    const out = r.metafile.outputs["out.mjs"];
    const gz = zlib.gzipSync(r.outputFiles[0].contents);
    console.log(
        `${label}: ${(out.bytes / 1024).toFixed(1)} KB min / ${
            (gz.length / 1024).toFixed(1)
        } KB gz`,
    );
}
