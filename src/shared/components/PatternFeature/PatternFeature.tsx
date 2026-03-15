import React from "react";
import { Card } from "@fremtind/jokul/card";
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
            className="pattern-feature jkl-flex flex-direction-column"
            style={{ padding: 0, position: "relative" }}
        >
            {post.illustration && (
                <div className="pattern-feature__bg" aria-hidden="true">
                    {post.illustration}
                </div>
            )}
            <div className="pattern-feature__content">
                <strong className="pattern-feature__title">{post.title}</strong>
                <p className="pattern-feature__excerpt muted">{post.excerpt}</p>
            </div>
        </Card>
    );
}
