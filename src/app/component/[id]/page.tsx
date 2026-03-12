"use client";

import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { Tag } from "@fremtind/jokul/tag";
import { Message } from "@fremtind/jokul/message";
import { Link } from "@fremtind/jokul/link";
import { useParams } from "next/navigation";
import { getComponentDoc } from "@/lib/componentDocs";
import { PropTable } from "@/components/PropTable";
import { CodeBlock } from "@/components/CodeBlock";

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

            <Flex direction="column" gap="m">
                <h2>Props</h2>
                <PropTable props={doc.props} />
            </Flex>

            <Flex direction="column" gap="xl">
                <h2>Eksempler</h2>
                {doc.examples.map((example) => (
                    <Flex key={example.title} direction="column" gap="m" className="component-example">
                        <Flex direction="column" gap="xs">
                            <h3>{example.title}</h3>
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
