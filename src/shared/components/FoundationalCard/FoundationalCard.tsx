/**
 * FoundationalCard
 *
 * Each card is a full-bleed viewport-width section.
 * The illustration fills the section background absolutely (edge to edge).
 * A gradient scrim fades the illustration out on the left so text reads cleanly.
 * Text content is re-constrained to body max-width via an inner wrapper.
 *
 * Uses FullBleed for the full-width breakout (same technique as footer/header).
 */

import Link from "next/link";
import {FullBleed} from "@/shared/components/FullBleed/FullBleed";
import type {FoundationalPost} from "@/features/foundational/data";
import "./foundational-card.scss";

interface FoundationalCardProps {
    post: FoundationalPost;
}

export function FoundationalCard({post}: FoundationalCardProps) {
    const href = `/jokul/foundational/${post.id}`;

    return (
        <FullBleed as={Link} href={href} className="foundational-card" aria-label={post.title}>
            {post.illustration && (
                <div className="foundational-card__bg" aria-hidden="true">
                    {post.illustration}
                </div>
            )}
            <div className="foundational-card__inner">
                <div className="foundational-card__content">
                    <h2 className="foundational-card__title">{post.title}</h2>
                    <p className="foundational-card__excerpt">{post.excerpt}</p>
                </div>
            </div>
        </FullBleed>
    );
}
