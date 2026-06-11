// The `kaplay-classy/debug` subpath export.
//
//     import "kaplay-classy/debug";
//
// Importing it installs the on-screen debug view (inspect mode, logs,
// cursor). Equivalent to importing and calling `installDebugView()` from the
// main entry — use that form if your bundler strips side-effect imports.

import { installDebugView } from "./debug/installDebugView";

export { installDebugView, uninstallDebugView } from "./debug/installDebugView";

installDebugView();
