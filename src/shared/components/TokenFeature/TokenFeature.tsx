import React from "react";
import { Card } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import type { TokenPost } from "@/features/token/data";
import { getTokenSlug } from "@/features/token/data";
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
            <Flex className="token-feature__content" direction="column" gap="xs">
                <strong className="token-feature__title">{post.title}</strong>
                <p className="token-feature__excerpt">{post.excerpt}</p>
            </Flex>
        </Card>
    );
}
