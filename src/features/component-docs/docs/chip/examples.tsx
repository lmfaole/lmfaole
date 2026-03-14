import { useState, useEffect } from "react";
import { Chip } from "@fremtind/jokul/chip";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Filter-chips",
                description: "Bruk filter-chips for å la brukeren velge kategorier.",
                code: `<Flex gap="xs" wrap="wrap">
      <Chip variant="filter" selected>Bil</Chip>
      <Chip variant="filter">Båt</Chip>
      <Chip variant="filter">Hjem</Chip>
      <Chip variant="filter" selected>Reise</Chip>
    </Flex>`,
                preview: (
                    <Flex gap="xs" wrap="wrap">
                        <Chip variant="filter" selected>Bil</Chip>
                        <Chip variant="filter">Båt</Chip>
                        <Chip variant="filter">Hjem</Chip>
                        <Chip variant="filter" selected>Reise</Chip>
                    </Flex>
                ),
            },
    {
                title: "Input-chips",
                description: "Bruk input-chips for tags som brukeren kan fjerne.",
                code: `<Flex gap="xs" wrap="wrap">
      <Chip variant="input">React</Chip>
      <Chip variant="input">TypeScript</Chip>
      <Chip variant="input">Next.js</Chip>
    </Flex>`,
                preview: (
                    <Flex gap="xs" wrap="wrap">
                        <Chip variant="input">React</Chip>
                        <Chip variant="input">TypeScript</Chip>
                        <Chip variant="input">Next.js</Chip>
                    </Flex>
                ),
            }
];
