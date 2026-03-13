import React from "react";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import { PostMeta } from "@/components/PostMeta";
import { slugify } from "@/lib/format";

interface PostArticleProps {
    title: string;
    excerpt: string;
    category: string;
    date: string;
    author?: string;
    content: React.ReactNode;
    tags?: string[];
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

export function PostArticle({ title, excerpt, category, date, author, content, tags }: PostArticleProps) {
    const headings = extractH2s(content);
    const contentWithIds = injectH2Ids(content);

    return (
        <article>
            <header>
                <h1>{title}</h1>
                <p>{excerpt}</p>
                <PostMeta category={category} date={date} author={author} content={content} tags={tags} />
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
