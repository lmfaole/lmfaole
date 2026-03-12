"use client";

import React from "react";
import { Link } from "@fremtind/jokul/link";
import { Flex } from "@fremtind/jokul/flex";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import { PostMeta } from "@/components/PostMeta";
import { useParams } from "next/navigation";
import { getFoundationalPost } from "@/lib/foundationalPosts";

function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

function extractH2s(node: React.ReactNode): string[] {
    const headings: string[] = [];
    React.Children.forEach(node, (child) => {
        if (!React.isValidElement(child)) return;
        const el = child as React.ReactElement<{ children?: React.ReactNode }>;
        if (el.type === "h2") {
            const text = typeof el.props.children === "string" ? el.props.children : "";
            if (text) headings.push(text);
        } else if (el.props?.children) {
            headings.push(...extractH2s(el.props.children));
        }
    });
    return headings;
}

function injectH2Ids(node: React.ReactNode): React.ReactNode {
    return React.Children.map(node, (child) => {
        if (!React.isValidElement(child)) return child;
        const el = child as React.ReactElement<{ children?: React.ReactNode; id?: string }>;
        if (el.type === "h2" && typeof el.props.children === "string") {
            return React.cloneElement(el, { id: slugify(el.props.children) });
        }
        if (el.props?.children) {
            return React.cloneElement(el, { children: injectH2Ids(el.props.children) } as Partial<typeof el.props>);
        }
        return child;
    });
}

export default function FoundationalPostPage() {
    const params = useParams();
    const post = getFoundationalPost(params.id as string);

    if (!post) {
        return (
            <Flex as="main" direction="column" gap="m">
                <h1>Fant ikke innlegget</h1>
                <Link href="/foundational">Tilbake til grunnleggende konsepter</Link>
            </Flex>
        );
    }

    const headings = extractH2s(post.content);
    const contentWithIds = injectH2Ids(post.content);

    return (
        <Flex gap="xl" alignItems="start" as="main">
            {headings.length > 0 && (
                <TableOfContents label="Innhold" style={{ flexShrink: 0, position: "sticky", top: "2rem" }}>
                    {headings.map((h) => (
                        <TableOfContents.Link key={h} href={`#${slugify(h)}`}>{h}</TableOfContents.Link>
                    ))}
                </TableOfContents>
            )}
            <Flex as="article" direction="column" gap="m" style={{ flex: 1, minWidth: 0 }}>
                <Flex as="header" direction="column" gap="s">
                    <h1>{post.title}</h1>
                    <p>{post.excerpt}</p>
                    <PostMeta category={post.category} date={post.date} author={post.author} content={post.content} tags={post.tags} />
                </Flex>
                {contentWithIds}
            </Flex>
        </Flex>
    );
}
