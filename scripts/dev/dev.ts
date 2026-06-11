// Used in npm dev script
// @ts-check

import esbuild from "esbuild";
import { CDN_PATH, DIST_DIR } from "../constants.ts";
import { config } from "../lib/build.ts";
import { serve } from "./serve.ts";

export async function dev() {
    serve();

    const outfile = `${DIST_DIR}/kaplay.js`;

    const ctx = await esbuild.context({
        ...config,
        format: "iife",
        globalName: "kaplay",
        entryPoints: [CDN_PATH],
        outfile,
        sourcemap: true,
        minify: false,
        minifyIdentifiers: false,
        minifySyntax: false,
        minifyWhitespace: false,
        keepNames: true,
        plugins: [
            {
                name: "logger",
                setup(b) {
                    b.onEnd(() => {
                        console.log(`-> ${outfile}`);
                    });
                },
            },
        ],
    });

    await ctx.watch();
}
