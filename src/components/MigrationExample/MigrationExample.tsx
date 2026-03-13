import React from "react";
import {Flex} from "@fremtind/jokul/flex";
import {Icon} from "@fremtind/jokul/icon";
import {Tag} from "@fremtind/jokul/tag";
import {CodeBlock} from "@/components/CodeBlock";
import type {ComponentExample} from "@/lib/docs/types";

interface MigrationExampleProps {
    example: ComponentExample & { migrationBefore: string };
}

export function MigrationExample({example}: MigrationExampleProps) {
    return (
        <Flex direction="column" gap="m">
            <Flex direction="column" gap="xs">
                <Flex gap="s" alignItems="center">
                    <h3>{example.title}</h3>
                    <Tag variant="warning">Utfaset</Tag>
                </Flex>
                {example.description && <p>{example.description}</p>}
            </Flex>
            <Flex wrap="wrap">
                <CodeBlock code={example.migrationBefore} hideCopyButton title={<Tag variant="error">
                    <Icon>close</Icon>
                    <span>Før</span>
                </Tag>}/>
                <CodeBlock code={example.code} title={<Tag variant="success">
                    <Icon>check</Icon>
                    <span>Etter</span>
                </Tag>}/>
            </Flex>
        </Flex>
    );
}
