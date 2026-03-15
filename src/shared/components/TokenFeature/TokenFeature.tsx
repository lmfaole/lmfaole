import React from "react";
import { Card } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
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
        >
            <div className="token-feature">
                {post.illustration && (
                    <div className="token-feature__bg" aria-hidden="true">
                        {post.illustration}
                    </div>
                )}
                <Flex className="token-feature__content" alignItems="center" justifyContent="center">
                    <strong className="token-feature__title">{post.title}</strong>
                </Flex>
            </div>
        </Card>
    );
}
