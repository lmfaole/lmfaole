import { foundationalPosts } from "./foundational";
import type { BlogPost } from "./blog/types";

export type { BlogPost };
export { foundationalPosts };

export function getFoundationalPost(id: number | string): BlogPost | undefined {
    return foundationalPosts.find((p) => p.id === Number(id));
}
