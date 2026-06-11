// @ts-check

import { build } from "./lib/build.ts";

const fastModeArg = process.argv[2];
const fastMode = fastModeArg == "--fast";

await build(fastMode);
