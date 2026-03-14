import React from "react";
import Link from "next/link";
import {Breadcrumb, BreadcrumbItem} from "@fremtind/jokul/breadcrumb";
import {TableOfContents} from "@fremtind/jokul/table-of-contents";
import {Card} from "@fremtind/jokul/card";
import {DataTable} from "@fremtind/jokul/table";
import {Tab, TabList, TabPanel, Tabs} from "@fremtind/jokul/tabs";
import {FoundationalHeader} from "@/features/foundational/components/FoundationalHeader";
import {ScssMixinSection} from "@/features/foundational/components/ScssMixinSection";
import {Section} from "@/features/foundational/components/Section";
import {slugify} from "@/shared/utils/format";
import {extractH2s, injectH2Ids} from "@/shared/utils/article";
import type {ScssMixin, TokenTable} from "@/features/foundational/posts/types";

interface FoundationalArticleProps {
    title: string;
    excerpt: string;
    tokenOverview?: TokenTable[];
    scssSection?: ScssMixin[];
    meta?: React.ReactNode;
    illustration?: React.ReactNode;
    content: React.ReactNode;
}

export function FoundationalArticle({
                                        title,
                                        excerpt,
                                        meta,
                                        illustration,
                                        tokenOverview,
                                        scssSection,
                                        content
                                    }: FoundationalArticleProps) {
    const contentHeadings = extractH2s(content);
    const autoHeadings = [
        ...(tokenOverview ? ["Tokens"] : []),
        ...(scssSection ? ["SCSS-mixins"] : []),
    ];
    const headings = [...autoHeadings, ...contentHeadings];
    const contentWithIds = injectH2Ids(content);

    return (
        <article>
            <Breadcrumb>
                <BreadcrumbItem>
                    <Link href="/jokul/foundational" className="jkl-link">Grunnleggende</Link>
                </BreadcrumbItem>
                <BreadcrumbItem isLastElement>
                    <span>{title}</span>
                </BreadcrumbItem>
            </Breadcrumb>

            <FoundationalHeader title={title} excerpt={excerpt} illustration={illustration}/>

            {headings.length > 0 && (
                <Card padding="l" className="foundational-toc-card">
                    <TableOfContents label="Innhold">
                        {headings.map((h) => (
                            <TableOfContents.Link key={h} href={`#${slugify(h)}`}>{h}</TableOfContents.Link>
                        ))}
                    </TableOfContents>
                </Card>
            )}

            {meta && <div className="foundational-article__meta">{meta}</div>}

            <div className="post-prose">
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
                        <ScssMixinSection mixins={scssSection} />
                    </Section>
                )}

                {contentWithIds}
            </div>
        </article>
    );
}
