// Entry for the IIFE (CDN / script-tag) build. Script-tag users can't
// tree-shake anyway, so this bundles the full library with the debug view
// installed, matching the classic KAPLAY dev experience (F1 inspect mode).

import { installDebugView } from "./debug/installDebugView";

export * from "./index";

installDebugView();
