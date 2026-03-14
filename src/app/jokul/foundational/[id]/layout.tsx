"use client";

export const runtime = "edge";

import { Flex } from "@fremtind/jokul/flex";
import { FoundationalResources } from "@/features/foundational/components/FoundationalResources";
import { getFoundationalPost } from "@/features/foundational/data";
import { useParams } from "next/navigation";
import { useBodyTheme } from "@/shared/hooks/useBodyTheme";

export default function FoundationalPostLayout({ children }: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const post = getFoundationalPost(id);

    useBodyTheme("dark");

    return (
        <Flex direction="column" gap="2xl">
            {children}
            {post?.resources && post.resources.length > 0 && (
                <FoundationalResources resources={post.resources} />
            )}
        </Flex>
    );
}
