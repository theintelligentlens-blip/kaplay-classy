// The on-screen debug view: inspect mode (toggled with the debug key, F1 by
// default), object inspection overlays, `game.debug.log()` messages and the
// virtual cursor.
//
// It must be installed explicitly — either through the `kaplay-classy/debug`
// subpath, or by calling `installDebugView()` from the main entry. Games
// that don't install it don't bundle its rendering code.

import { drawDebug } from "../gfx/draw/drawDebug";
import { setDebugViewRenderer } from "./debugView";

/** Install the on-screen debug view (inspect mode, logs, cursor). */
export function installDebugView() {
    setDebugViewRenderer(drawDebug);
}

/** Remove the on-screen debug view. */
export function uninstallDebugView() {
    setDebugViewRenderer(null);
}
