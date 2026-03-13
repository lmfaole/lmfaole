"use client";

import React from "react";
import { Link } from "@fremtind/jokul/link";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import { PostMeta } from "@/components/PostMeta";
import { useParams } from "next/navigation";
import { getFoundationalPost } from "@/lib/foundationalPosts";
import { slugify } from "@/lib/format";

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
            <main>
                <h1>Fant ikke innlegget</h1>
                <Link href="/foundational">Tilbake til grunnleggende konsepter</Link>
            </main>
        );
    }

    const headings = extractH2s(post.content);
    const contentWithIds = injectH2Ids(post.content);

    return (
        <article>
            <header>
                <h1>{post.title}</h1>
                <p>{post.excerpt}</p>
                <PostMeta category={post.category} date={post.date} author={post.author} content={post.content} tags={post.tags} />
            </header>
            {headings.length > 0 && (
                <TableOfContents label="Innhold">
                    {headings.map((h) => (
                        <TableOfContents.Link key={h} href={`#${slugify(h)}`}>{h}</TableOfContents.Link>
                    ))}
                </TableOfContents>
            )}
            {contentWithIds}
        </article>
    );
}
