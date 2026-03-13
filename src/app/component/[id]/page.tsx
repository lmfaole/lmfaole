"use client";

import React from "react";
import {Flex} from "@fremtind/jokul/flex";
import {Tag} from "@fremtind/jokul/tag";
import {Message} from "@fremtind/jokul/message";
import {Link} from "@fremtind/jokul/link";
import {TableOfContents} from "@fremtind/jokul/table-of-contents";
import {Tab, TabList, TabPanel, Tabs} from "@fremtind/jokul/tabs";
import {Card} from "@fremtind/jokul/card";
import {useParams} from "next/navigation";
import {getComponentDoc} from "@/lib/componentDocs";
import {PropTable} from "@/components/PropTable";
import {CodeBlock} from "@/components/CodeBlock";
import {MigrationExample} from "@/components/MigrationExample";

import {slugify, toPascalCase} from "@/lib/format";

export default function ComponentPage() {
    const params = useParams();
    const doc = getComponentDoc(params.id as string);

    if (!doc) {
        return (
            <main>
                <h1>Fant ikke komponenten</h1>
                <Link href="/component">Tilbake til alle komponenter</Link>
            </main>
        );
    }

    const regularExamples = doc.examples.filter((ex) => !ex.migrationBefore);
    const migrationExamples = doc.examples.filter((ex) => !!ex.migrationBefore);

    return (
        <article>
            <header>
                <Flex gap="s" alignItems="center">
                    <h1>{doc.name}</h1>
                    <Tag variant="neutral">{doc.category}</Tag>
                </Flex>
                <code className="component-package">{doc.package}</code>
                <p>{doc.description}</p>
                {doc.notes && (
                    <Message variant="info">{doc.notes}</Message>
                )}
                {regularExamples[0]?.preview && (
                    <Card padding="l"
                          style={{display: "flex", alignItems: "center", justifyContent: "center", minHeight: "10rem"}}>
                        <div style={{pointerEvents: "none", userSelect: "none", width: "100%"}}>
                            {regularExamples[0].preview}
                        </div>
                    </Card>
                )}
            </header>

            <TableOfContents label="Innhold">
                <TableOfContents.Link href="#props">Props</TableOfContents.Link>
                {regularExamples.length > 0 && (
                    <TableOfContents.Link href="#eksempler">Eksempler</TableOfContents.Link>
                )}
                {migrationExamples.length > 0 && (
                    <TableOfContents.Link href="#migrering">Migrering</TableOfContents.Link>
                )}
            </TableOfContents>

            <section>
                <h2 id="props">Props</h2>
                {doc.subComponents && doc.subComponents.length > 0 ? (
                    <Tabs>
                        <TabList>
                            <Tab>{doc.name} <span style={{
                                color: "var(--jkl-color-text-subdued)",
                                fontVariantNumeric: "tabular-nums"
                            }}>({doc.props.length})</span></Tab>
                            {doc.subComponents.map((sub) => (
                                <Tab key={sub.name}>{sub.name} <span style={{
                                    color: "var(--jkl-color-text-subdued)",
                                    fontVariantNumeric: "tabular-nums"
                                }}>({sub.props.length})</span></Tab>
                            ))}
                        </TabList>
                        <TabPanel>
                            <Card padding="l">
                                <PropTable props={doc.props}/>
                            </Card>
                        </TabPanel>
                        {doc.subComponents.map((sub) => (
                            <TabPanel key={sub.name}>
                                <Card padding="l">
                                    {sub.description &&
                                        <p style={{marginBottom: "var(--jkl-spacing-m)"}}>{sub.description}</p>}
                                    <PropTable props={sub.props}/>
                                </Card>
                            </TabPanel>
                        ))}
                    </Tabs>
                ) : (
                    <PropTable props={doc.props}/>
                )}
            </section>

            <section>
                <h2 id="eksempler">Eksempler</h2>
                {regularExamples.map((example) => (
                    <div key={example.title} className="component-example">
                        <h3 id={slugify(example.title)}>{example.title}</h3>
                        {example.description && <p>{example.description}</p>}
                        {example.uses && example.uses.length > 0 && (
                            <Flex gap="xs" alignItems="center" wrap="wrap">
                                <span style={{
                                    fontSize: "var(--jkl-font-size-s)",
                                    color: "var(--jkl-color-text-subdued)"
                                }}>Bruker:</span>
                                <Flex as="ul" className="chip-list" gap="xs" wrap="wrap">
                                    {example.uses.map((id) => (
                                        <li key={id}>
                                            <Link href={`/component/${id}`}>
                                                <Tag variant="neutral">{toPascalCase(id)}</Tag>
                                            </Link>
                                        </li>
                                    ))}
                                </Flex>
                            </Flex>
                        )}
                        {example.preview && (
                            <div className="component-example__preview">
                                {example.preview}
                            </div>
                        )}
                        <CodeBlock code={example.code}/>
                    </div>
                ))}
            </section>

            {migrationExamples.length > 0 && (
                <section>
                    <h2 id="migrering">Migrering</h2>
                    <p>Disse eksemplene viser hvordan du erstatter utfasede props med den anbefalte API-en.</p>
                    {migrationExamples.map((example) => (
                        <MigrationExample
                            key={example.title}
                            example={example as typeof example & { migrationBefore: string }}
                        />
                    ))}
                </section>
            )}
        </article>
    );
}
