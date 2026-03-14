"use client";

export const runtime = "edge";

import { Flex } from "@fremtind/jokul/flex";
import { BlogNavigation } from "@/features/blog/components/BlogNavigation";
import { BlogResources } from "@/features/blog/components/BlogResources";
import { getBlogPost, getNextPost, getPreviousPost, getRelatedPosts } from "@/features/blog/data";
import { useParams } from "next/navigation";

export default function PostLayout({ children }: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>();

    const post = getBlogPost(id);
    const previous = getPreviousPost(id);
    const next = getNextPost(id);
    const related = getRelatedPosts(id);

    return (
        <Flex direction="column" gap="xl">
            {children}
            {post?.resources && post.resources.length > 0 && (
                <BlogResources resources={post.resources} />
            )}
            <BlogNavigation previous={previous} next={next} related={related} />
        </Flex>
    );
}
