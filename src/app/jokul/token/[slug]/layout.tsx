"use client";

export const runtime = "edge";

import {Flex} from "@fremtind/jokul/flex";
import {TokenResources} from "@/features/token/components/TokenResources";
import {getTokenPost} from "@/features/token/data";
import {useParams} from "next/navigation";

export default function TokenPostLayout({children}: { children: React.ReactNode }) {
    const {slug} = useParams<{ slug: string }>();
    const post = getTokenPost(slug);

    return (
        <Flex direction="column" gap="2xl">
            {children}
            {post?.resources && post.resources.length > 0 && (
                <TokenResources resources={post.resources}/>
            )}
        </Flex>
    );
}
