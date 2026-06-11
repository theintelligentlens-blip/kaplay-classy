// Build KAPLAY Classy

import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { DIST_DIR, SRC_PATH } from "../constants.ts";

const pkgFile = path.join(import.meta.dirname, "../../package.json");
const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
const pkgVersion = pkg.version;

export const fmts = (name: string): esbuild.BuildOptions[] => [
    {
        format: "iife",
        globalName: "kaplay",
        outfile: `${DIST_DIR}/${name}.js`,
    },
    { format: "cjs", outfile: `${DIST_DIR}/${name}.cjs` },
    { format: "esm", outfile: `${DIST_DIR}/${name}.mjs` },
];

const builds = fmts("kaplay");

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
    entryPoints: [SRC_PATH],
    define: {
        "KAPLAY_VERSION": JSON.stringify(pkgVersion),
    },
};

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
    );
}
