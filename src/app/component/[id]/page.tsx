"use client";

import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { Tag } from "@fremtind/jokul/tag";
import { Message } from "@fremtind/jokul/message";
import { Link } from "@fremtind/jokul/link";
import { TableOfContents } from "@fremtind/jokul/table-of-contents";
import { useParams } from "next/navigation";
import { getComponentDoc } from "@/lib/componentDocs";
import { PropTable } from "@/components/PropTable";
import { CodeBlock } from "@/components/CodeBlock";

function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export default function ComponentPage() {
    const params = useParams();
    const doc = getComponentDoc(params.id as string);

    if (!doc) {
        return (
            <Flex as="main" direction="column" gap="m">
                <h1>Fant ikke komponenten</h1>
                <Link href="/component">Tilbake til alle komponenter</Link>
            </Flex>
        );
    }

    return (
        <Flex as="article" direction="column" gap="xl">
                <Flex as="header" direction="column" gap="s">
                    <Flex gap="s" alignItems="center">
                        <h1>{doc.name}</h1>
                        <Tag variant="neutral">{doc.category}</Tag>
                    </Flex>
                    <code className="component-package">{doc.package}</code>
                    <p>{doc.description}</p>
                    {doc.notes && (
                        <Message variant="info">{doc.notes}</Message>
                    )}
                </Flex>

                <TableOfContents label="Innhold">
                    <TableOfContents.Link href="#props">Props</TableOfContents.Link>
                    {doc.subComponents?.map((sub) => (
                        <TableOfContents.Link key={sub.name} href={`#props-${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                            {sub.name}
                        </TableOfContents.Link>
                    ))}
                    {doc.examples.map((ex) => (
                        <TableOfContents.Link key={ex.title} href={`#${slugify(ex.title)}`}>
                            {ex.title}
                        </TableOfContents.Link>
                    ))}
                </TableOfContents>

                <Flex direction="column" gap="l">
                    <h2 id="props">Props</h2>
                    <Flex direction="column" gap="m">
                        <h3 id="props-root">{doc.name}</h3>
                        <PropTable props={doc.props} />
                    </Flex>
                    {doc.subComponents?.map((sub) => (
                        <Flex key={sub.name} direction="column" gap="m">
                            <Flex direction="column" gap="xs">
                                <h3 id={`props-${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{sub.name}</h3>
                                {sub.description && <p>{sub.description}</p>}
                            </Flex>
                            <PropTable props={sub.props} />
                        </Flex>
                    ))}
                </Flex>

                <Flex direction="column" gap="xl">
                    <h2>Eksempler</h2>
                    {doc.examples.map((example) => (
                        <Flex key={example.title} direction="column" gap="m" className="component-example">
                            <Flex direction="column" gap="xs">
                                <h3 id={slugify(example.title)}>{example.title}</h3>
                                {example.description && <p>{example.description}</p>}
                            </Flex>
                            {example.preview && (
                                <div className="component-example__preview">
                                    {example.preview}
                                </div>
                            )}
                            <CodeBlock code={example.code} />
                        </Flex>
                    ))}
                </Flex>
        </Flex>
    );
}
