import React from "react";
import {TableOfContents} from "@fremtind/jokul/table-of-contents";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";
import {DataTable} from "@fremtind/jokul/table";
import {Tab, TabList, TabPanel, Tabs} from "@fremtind/jokul/tabs";
import {PageHero} from "@/shared/components/PageHero/PageHero";
import {ScssMixinSection} from "@/features/token/components/ScssMixinSection";
import {Section} from "@/features/token/components/Section";
import {slugify} from "@/shared/utils/format";
import type {ScssMixin, TokenTable} from "@/features/token/posts/types";

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
            <PageHero title={title} background={illustration} />

            {headings.length > 0 && (
                <Card padding="l" className="token-toc-card">
                    <TableOfContents label="Innhold">
                        {headings.map((h) => (
                            <TableOfContents.Link key={h} href={`#${slugify(h)}`}>{h}</TableOfContents.Link>
                        ))}
                    </TableOfContents>
                </Card>
            )}

            {meta && <div className="token-article__meta">{meta}</div>}

            <Flex className="post-prose" direction="column" gap="l">
                {tokenOverview && (
                    <Section title="Tokens">
                        {tokenOverview.length === 1 ? (
                            <>
                                {tokenOverview[0].description && <p>{tokenOverview[0].description}</p>}
                                <DataTable
                                    caption={tokenOverview[0].caption}
                                    columns={tokenOverview[0].columns}
                                    rows={tokenOverview[0].rows}
                                />
                            </>
                        ) : (
                            <Tabs>
                                <TabList aria-label="Token-kategorier">
                                    {tokenOverview.map((table) => (
                                        <Tab key={table.caption}>{table.heading ?? table.caption}</Tab>
                                    ))}
                                </TabList>
                                {tokenOverview.map((table) => (
                                    <TabPanel key={table.caption}>
                                        <Card padding="l">
                                            {table.description && <p>{table.description}</p>}
                                            <DataTable
                                                caption={table.caption}
                                                columns={table.columns}
                                                rows={table.rows}
                                            />
                                        </Card>
                                    </TabPanel>
                                ))}
                            </Tabs>
                        )}
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
