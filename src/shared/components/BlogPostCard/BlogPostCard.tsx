/**
 * BlogPostCard
 *
 * Card with optional image using Jøkul's CardImage component.
 *
 * CardImage usage in cards:
 * ─────────────────────────────────────────────────────────────────────────
 * Import:  import { Card, CardImage } from "@fremtind/jokul/card";
 *
 * `CardImage` is a polymorphic img-like component that automatically applies
 * negative margins so the image bleeds flush to the card edges, regardless
 * of the Card's `padding` value. You never need to calculate margins manually.
 *
 * placement prop:
 *   "top"    — image is first child (default). Negative margin on top + sides.
 *   "middle" — image sits between other content. Negative margin on sides only.
 *   "bottom" — image is last child. Negative margin on bottom + sides.
 *   "full"   — image is the only content. Negative margin on all sides.
 *              Use with padding="s" on Card since padding is still used for
 *              the margin calculation even in "full" mode.
 *
 * Rendering as a different element:
 *   <CardImage as="div" style={{ backgroundImage: ... }} placement="top" />
 *   Useful when you want a CSS background-image instead of an <img>.
 *
 * Clickable cards:
 *   Use Card as={NextLink} href={...} clickable aria-label="…" to make the
 *   entire card a single navigation target. Don't nest a <Link> inside —
 *   interactive elements cannot be descendants of interactive elements.
 *   Always set aria-label so screen readers announce a useful destination
 *   instead of reading out all card content.
 * ─────────────────────────────────────────────────────────────────────────
 */

import Link from "next/link";
import { Card, CardImage } from "@fremtind/jokul/card";
import type { BlogPost } from "@/features/blog/data";
import "./blog-post-card.scss";

interface BlogPostCardProps {
    post: BlogPost;
    href?: string;
}

export function BlogPostCard({ post, href }: BlogPostCardProps) {
    const to = href ?? `/jokul/blog/${post.id}`;

    return (
        <Card
            as={Link}
            href={to}
            padding="s"
            clickable
            aria-label={post.title}
            className="post-card"
        >
            {post.image && (
                <CardImage
                    src={post.image}
                    alt=""
                    placement="top"
                    className="post-card__image"
                />
            )}
            <div className="post-card__body">
                <h2 className="post-card__title">{post.title}</h2>
                <p className="post-card__excerpt">{post.excerpt}</p>
            </div>
        </Card>
    );
}
