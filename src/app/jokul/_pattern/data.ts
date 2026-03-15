export { patternPosts } from "./posts";
export type { PatternPost, PatternId } from "./posts";

import { patternPosts } from "./posts";
import type { PatternPost } from "./posts";

export function getPatternPost(id: string | number): PatternPost | undefined {
    // Defensive normalization: some runtimes/routers can leak search params into the segment string.
    // Pattern IDs are numeric, so we can safely extract digits only.
    const raw = decodeURIComponent(String(id)).split(/[?#]/)[0];
    const match = raw.match(/^\d+$/);
    if (!match) {
        return undefined;
    }

    const numericId = Number(match[0]);
    return patternPosts.find((p) => p.id === numericId);
}

export function getPatternHref(post: Pick<PatternPost, "id">): string {
    return `/jokul/monster/${post.id}`;
}
