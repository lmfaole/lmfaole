"use client";

export const runtime = "edge";

import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { PostResources } from "@/components/PostResources";
import { getFoundationalPost } from "@/lib/foundationalPosts";
import { useParams } from "next/navigation";
import { useBodyTheme } from "@/hooks/useBodyTheme";

export default function FoundationalPostLayout({ children }: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const post = getFoundationalPost(id);

    useBodyTheme("dark");

    return (
        <Flex direction="column" gap="2xl">
            <NavLink href="/jokul/foundational" back>Tilbake til grunnleggende</NavLink>
            {children}
            {post?.resources && post.resources.length > 0 && (
                <PostResources resources={post.resources} />
            )}
        </Flex>
    );
}
