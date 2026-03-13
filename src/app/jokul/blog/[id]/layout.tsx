"use client";

import React from "react";
import {Flex} from "@fremtind/jokul/flex";
import {PostNavigation} from "@/components/PostNavigation";
import {PostResources} from "@/components/PostResources";
import {getBlogPost, getNextPost, getPreviousPost, getRelatedPosts} from "@/lib/blogPosts";
import {NavLink} from "@fremtind/jokul/nav-link";
import { useParams } from "next/navigation";

export default function PostLayout({children}: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>();

    const post = getBlogPost(id);
    const previous = getPreviousPost(id);
    const next = getNextPost(id);
    const related = getRelatedPosts(id);

    return (
        <Flex direction="column" gap="xl">
            <NavLink href="/jokul/blog" back>Tilbake til alle innlegg</NavLink>
            {children}
            {post?.resources && post.resources.length > 0 && (
                <PostResources resources={post.resources} />
            )}
            <PostNavigation previous={previous} next={next} related={related}/>
        </Flex>
    );
}
