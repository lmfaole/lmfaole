export { foundationalPosts } from "./posts";
export type { FoundationalPost, FoundationalResource } from "./posts/types";

import { foundationalPosts } from "./posts";
import type { FoundationalPost } from "./posts/types";

export function getFoundationalPost(id: number | string): FoundationalPost | undefined {
    return foundationalPosts.find((p) => p.id === Number(id));
}
