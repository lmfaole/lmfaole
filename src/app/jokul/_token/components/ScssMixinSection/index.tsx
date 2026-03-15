"use client";

import React, { useState } from "react";
import { Chip } from "@fremtind/jokul/chip";
import { Flex } from "@fremtind/jokul/flex";
import { CodeBlock } from "@/shared/components/CodeBlock";
import type { ScssMixin } from "@/app/jokul/_token/posts/types";

interface ScssMixinSectionProps {
    mixins: ScssMixin[];
}

export function ScssMixinSection({ mixins }: ScssMixinSectionProps) {
    const [active, setActive] = useState(mixins[0]?.name ?? null);
    const current = mixins.find((m) => m.name === active) ?? mixins[0];

    return (
        <>
            <Flex gap="xs" wrap="wrap" style={{ marginBottom: "var(--jkl-spacing-m)" }} role="group" aria-label="Velg mixin">
                {mixins.map((mixin) => (
                    <Chip
                        key={mixin.name}
                        variant="filter"
                        selected={mixin.name === active}
                        onClick={() => setActive(mixin.name)}
                    >
                        {mixin.name}
                    </Chip>
                ))}
            </Flex>

            {current && (
                <>
                    <p>{current.description}</p>
                    <CodeBlock code={current.example} />
                </>
            )}
        </>
    );
}
