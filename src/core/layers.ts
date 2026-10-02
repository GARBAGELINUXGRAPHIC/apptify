// Returning photos sit below page navigation, which fades in as the backdrop fades out.
export const overlayZIndex = (depth: number) => 1200 + depth * 20
export const imageReturnZIndex = (depth: number) => depth === 0 ? 30 : overlayZIndex(depth)
