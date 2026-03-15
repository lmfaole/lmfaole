import React from "react";
import { Card } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import type { PatternPost } from "@/app/jokul/_pattern/data";
import { getPatternHref } from "@/app/jokul/_pattern/data";
import "./pattern-feature.scss";

interface PatternFeatureProps {
    post: PatternPost;
}

/** Card linking to a pattern article under `/jokul/monster`. */
export function PatternFeature({ post }: PatternFeatureProps) {
    return (
        <Card
            as="a"
            href={getPatternHref(post)}
            clickable
            aria-label={post.title}
        >
            <div className="pattern-feature">
                {post.illustration && (
                    <div className="pattern-feature__bg" aria-hidden="true">
                        {post.illustration}
                    </div>
                )}
                <Flex className="pattern-feature__content" direction="column" justifyContent="end" gap="xs">
                    <strong className="pattern-feature__title">{post.title}</strong>
                    <p className="pattern-feature__excerpt muted">{post.excerpt}</p>
                </Flex>
            </div>
        </Card>
    );
}
