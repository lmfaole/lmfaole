import React from "react";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import { FullBleed } from "@/shared/components/FullBleed/FullBleed";
import { slugify } from "@/shared/utils/format";
import { extractH2s, injectH2Ids } from "@/shared/utils/article";
import "./blog-article.scss";

interface BlogArticleProps {
    title: string;
    excerpt: string;
    content: React.ReactNode;
}

function BlogHeader({ title, excerpt, content }: BlogArticleProps) {
    return (
        <FullBleed as="header" dots="fade-bottom" className="blog-article__header">
            <div className="blog-article__inner">
                <h1 className="blog-article__title">{title}</h1>
                <p className="blog-article__excerpt">{excerpt}</p>
                {content && (
                    <div className="blog-article__byline">
                        <span>{Math.ceil(String(content).split(/\s+/).length / 200)} min lesing</span>
                    </div>
                )}
            </div>
        </FullBleed>
    );
}

export function BlogArticle({ title, excerpt, content }: BlogArticleProps) {
    const headings = extractH2s(content);
    const contentWithIds = injectH2Ids(content);

    return (
        <article>
            <BlogHeader title={title} excerpt={excerpt} content={content} />
            {headings.length > 0 && (
                <TableOfContents label="Innhold">
                    {headings.map((h) => (
                        <TableOfContents.Link key={h} href={`#${slugify(h)}`}>{h}</TableOfContents.Link>
                    ))}
                </TableOfContents>
            )}
            <div className="post-prose">
                {contentWithIds}
            </div>
        </article>
    );
}
