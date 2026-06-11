// Registry for the on-screen debug view (inspect mode, debug logs).
//
// The actual renderer lives behind the `kaplay-classy/debug` subpath export,
// so its drawing code (text formatting, line joins...) is only bundled when
// a game opts in.

let debugViewRenderer: (() => void) | null = null;

export function setDebugViewRenderer(renderer: (() => void) | null) {
    debugViewRenderer = renderer;
}

export function getDebugViewRenderer() {
    return debugViewRenderer;
}
