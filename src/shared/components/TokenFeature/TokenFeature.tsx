import React from "react";
import { Card } from "@fremtind/jokul/card";
import type { TokenPost } from "@/app/jokul/_token/data";
import { getTokenSlug } from "@/app/jokul/_token/data";
import "./token-feature.scss";

interface TokenFeatureProps {
    post: TokenPost;
}

/** Illustrated card linking to a token documentation article. */
export function TokenFeature({ post }: TokenFeatureProps) {
    return (
        <Card
            as="a"
            href={`/jokul/token/${getTokenSlug(post)}`}
            clickable
            aria-label={post.title}
            className="token-feature jkl-flex flex-direction-column"
            style={{ padding: 0, position: "relative" }}
        >
            {post.illustration && (
                <div className="token-feature__bg" aria-hidden="true">
                    {post.illustration}
                </div>
            )}
            <div className="token-feature__content">
                <strong className="token-feature__title">{post.title}</strong>
            </div>
        </Card>
    );
}
