// Build KAPLAY Classy

import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { CDN_PATH, DIST_DIR, SRC_PATH } from "../constants.ts";

const pkgFile = path.join(import.meta.dirname, "../../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
const pkgVersion = pkg.version;

// The IIFE (CDN) build bundles the full library + debug view; the ESM/CJS
// builds are the tree-shakeable package entries.
const builds: esbuild.BuildOptions[] = [
    {
        format: "iife",
        globalName: "kaplay",
        entryPoints: [CDN_PATH],
        outfile: `${DIST_DIR}/kaplay.js`,
    },
    {
        format: "esm",
        entryPoints: [SRC_PATH],
        outfile: `${DIST_DIR}/kaplay.mjs`,
    },
    {
        format: "cjs",
        entryPoints: [SRC_PATH],
        outfile: `${DIST_DIR}/kaplay.cjs`,
    },
];

export const config: esbuild.BuildOptions = {
    bundle: true,
    minify: true,
    keepNames: false,
    // MORE MINIFICATION
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    loader: {
        ".png": "dataurl",
        ".glsl": "text",
        ".mp3": "binary",
    },
    define: {
        "KAPLAY_VERSION": JSON.stringify(pkgVersion),
    },
};

// The `kaplay-classy/debug` subpath is a thin wrapper over the main bundle,
// so the debug view shares the same module state as the engine.
function writeDebugEntry() {
    fs.writeFileSync(
        `${DIST_DIR}/debug.mjs`,
        `import { installDebugView } from "./kaplay.mjs";\n`
            + `export { installDebugView, uninstallDebugView } from "./kaplay.mjs";\n`
            + `installDebugView();\n`,
    );
    fs.writeFileSync(
        `${DIST_DIR}/debug.cjs`,
        `const { installDebugView, uninstallDebugView } = require("./kaplay.cjs");\n`
            + `installDebugView();\n`
            + `module.exports = { installDebugView, uninstallDebugView };\n`,
    );
    fs.writeFileSync(
        `${DIST_DIR}/debug.d.ts`,
        `export { installDebugView, uninstallDebugView } from "./doc";\n`,
    );
    console.log("-> dist/debug.{mjs,cjs,d.ts}");
}

export async function build(fast = false) {
    if (fast) {
        // fast build, no minification
        return esbuild.build({
            ...config,
            ...builds[0],
            bundle: true,
            minify: false,
            sourcemap: false,
            minifyIdentifiers: false,
            minifySyntax: false,
            minifyWhitespace: false,
        }).then(() => console.log("-> kaplay.js"));
    }
    return Promise.all(
        builds.map((fmt) => {
            return esbuild.build({
                ...config,
                ...fmt,
                sourcemap: true,
            }).then(() => console.log(`-> ${fmt.outfile}`));
        }),
    ).then(writeDebugEntry);
}
