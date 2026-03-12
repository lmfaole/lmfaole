import { foundationalPosts } from "./posts/foundational";
import type { BlogPost } from "./posts/types";

export type { BlogPost };
export { foundationalPosts };

export function getFoundationalPost(id: number | string): BlogPost | undefined {
    return foundationalPosts.find((p) => p.id === Number(id));
}
