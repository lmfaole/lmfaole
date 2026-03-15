import React from "react";
import {TableOfContents} from "@fremtind/jokul/table-of-contents";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";
import {DataTable} from "@fremtind/jokul/table";
import {PageHero} from "@/shared/components/PageHero/PageHero";
import {ScssMixinSection} from "@/app/jokul/_token/components/ScssMixinSection";
import {Section} from "@/app/jokul/_token/components/Section";
import {slugify} from "@/shared/utils/format";
import type {ScssMixin, TokenTable} from "@/app/jokul/_token/posts/types";

interface TokenArticleProps {
    title: string;
    excerpt: string;
    illustration: React.ReactNode;
    tokenOverview?: TokenTable[];
    scssSection?: ScssMixin[];
    meta?: React.ReactNode;
}

export function TokenArticle({
                                 title,
                                 excerpt,
                                 meta,
                                 illustration,
                                 tokenOverview,
                                 scssSection,
                             }: TokenArticleProps) {
    const headings = [
        ...(tokenOverview ? ["Tokens"] : []),
        ...(scssSection ? ["SCSS-mixins"] : []),
    ];

    return (
        <article>
            <PageHero title={title} background={illustration} description={excerpt} />

            {headings.length > 0 && (
                <div className="token-article__toc-card">
                    <Card padding="l">
                        <TableOfContents label="Innhold">
                            {headings.map((h) => (
                                <TableOfContents.Link key={h} href={`#${slugify(h)}`}>{h}</TableOfContents.Link>
                            ))}
                        </TableOfContents>
                    </Card>
                </div>
            )}

            {meta && <div className="token-article__meta">{meta}</div>}

            <Flex className="post-prose" direction="column" gap="l">
                {tokenOverview && (
                    <Section title="Tokens">
                        <Flex direction="column" gap="xl">
                            {tokenOverview.map((table) => (
                                <div key={table.caption}>
                                    {tokenOverview.length > 1 && <h3>{table.heading ?? table.caption}</h3>}
                                    {table.description && <p>{table.description}</p>}
                                    <DataTable
                                        caption={table.caption}
                                        columns={table.columns}
                                        rows={table.rows}
                                    />
                                </div>
                            ))}
                        </Flex>
                    </Section>
                )}

                {scssSection && scssSection.length > 0 && (
                    <Section title="SCSS-mixins">
                        <ScssMixinSection mixins={scssSection}/>
                    </Section>
                )}
            </Flex>
        </article>
    );
}
