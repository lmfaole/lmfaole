"use client";

import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { PostResources } from "@/components/PostResources";
import { getFoundationalPost } from "@/lib/foundationalPosts";
import { useParams } from "next/navigation";

export default function FoundationalPostLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const id = params.id as string;

    const post = getFoundationalPost(id);

    return (
        <Flex direction="column" gap="xl">
            <NavLink href="/foundational" back>Tilbake til grunnleggende konsepter</NavLink>
            {children}
            {post?.resources && post.resources.length > 0 && (
                <PostResources resources={post.resources} />
            )}
        </Flex>
    );
}
