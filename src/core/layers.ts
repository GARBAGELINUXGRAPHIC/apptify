// Content < returning image < navigation < active overlays < notifications.
export const overlayZIndex = (depth: number) => 1200 + depth * 20
// A viewer opened inside a dialog must return above that dialog's content.
export const imageReturnZIndex = (depth: number) => depth === 0 ? 30 : overlayZIndex(depth)
