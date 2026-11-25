/** The design system's Image Transformations as `image-sources.ts` takes them (kept apart, so its test need not load the design system). */
import { canTransform, transformedImage } from "@lmfaole/designsystem/lib/cloudflare"

import type { Transform } from "./image-sources.ts"

/** `IMAGE_TRANSFORMS` "1": each width made by the zone, never larger than the source (`scale-down`), in the format the browser takes best. */
export const cloudflareImages = (on: boolean): Transform | null => (on ? (src, width) => (canTransform(src) ? transformedImage(src, { width, fit: "scale-down" }) : null) : null)
