import { blogPosts } from "./blogPostsData";
import type { BlogPost, Resource } from "./blogPostsData";

export type { BlogPost, Resource };
export { blogPosts };

function extractText(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (typeof node === "object") {
    const props = (node as Record<string, unknown>)["props"] as
      | Record<string, unknown>
      | undefined;
    if (props?.["children"] != null) return extractText(props["children"]);
  }
  return "";
}

/** Returns estimated reading time in minutes based on ~200 words per minute. */
export function readingTime(content: React.ReactNode): number {
  const words = extractText(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function getBlogPost(id: number | string): BlogPost | undefined {
  return blogPosts.find((post) => post.id === Number(id));
}

export function getPreviousPost(id: number | string): BlogPost | undefined {
  const index = blogPosts.findIndex((post) => post.id === Number(id));
  return index > 0 ? blogPosts[index - 1] : undefined;
}

export function getNextPost(id: number | string): BlogPost | undefined {
  const index = blogPosts.findIndex((post) => post.id === Number(id));
  return index !== -1 && index < blogPosts.length - 1 ? blogPosts[index + 1] : undefined;
}

export function getRelatedPosts(id: number | string, limit = 2): BlogPost[] {
  const post = getBlogPost(id);
  if (!post) return [];
  return blogPosts
    .filter((p) => p.id !== post.id && p.category === post.category)
    .slice(0, limit);
}
