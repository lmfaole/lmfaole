import { useState, useEffect } from "react";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { CardDetailPreview } from "../card/examples";
import { FlexCardGridPreview } from "../flex/examples";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const TAG_VARIANTS = ["success", "warning", "error", "info", "neutral"];

const TAG_LABELS = ["Aktiv", "Utløper snart", "Kansellert", "Ny", "Standard"];


export const examples: ComponentExample[] = [
    {
                title: "Alle varianter",
                description: "Semantiske varianter matcher Message-farger for konsistens.",
                code: `<Flex gap="xs" wrap="wrap">
      <Tag variant="neutral">Nøytral</Tag>
      <Tag variant="info">Info</Tag>
      <Tag variant="success">Suksess</Tag>
      <Tag variant="warning">Advarsel</Tag>
      <Tag variant="error">Feil</Tag>
    </Flex>`,
                preview: (
                    <Flex gap="xs" wrap="wrap">
                        <Tag variant="neutral">Nøytral</Tag>
                        <Tag variant="info">Info</Tag>
                        <Tag variant="success">Suksess</Tag>
                        <Tag variant="warning">Advarsel</Tag>
                        <Tag variant="error">Feil</Tag>
                    </Flex>
                ),
            },
    {
                title: "Tags for kategorisering",
                description: "Typisk bruksmønster: gruppe av tags som beskriver innholdskategorier.",
                code: `<Flex gap="xs" wrap="wrap">
      <Tag>React</Tag>
      <Tag>TypeScript</Tag>
      <Tag>Next.js</Tag>
      <Tag variant="neutral">Nytt</Tag>
    </Flex>`,
                preview: (
                    <Flex gap="xs" wrap="wrap">
                        <Tag>React</Tag>
                        <Tag>TypeScript</Tag>
                        <Tag>Next.js</Tag>
                        <Tag variant="neutral">Nytt</Tag>
                    </Flex>
                ),
            },
    {
                title: "Tag som statusindikator i kort",
                description: "Typisk bruk: Tag i kortoverskrift for å vise avtale- eller forsikringsstatus.",
                uses: ["card", "flex", "description-list", "button"],
                code: `<Card padding="l">
      <Flex justifyContent="space-between" alignItems="center">
        <h2>Bilforsikring kasko</h2>
        <Tag variant="success">Aktiv</Tag>
      </Flex>
      {/* … resten av kortinnholdet */}
    </Card>`,
                preview: <CardDetailPreview />,
            },
    {
                title: "Tags i kortliste",
                description: "Flere kort med statustagg — slik Tags brukes i listevisning av avtaler.",
                uses: ["card", "flex", "button"],
                code: `<Flex gap="m" wrap="wrap">
      {avtaler.map(({ title, status, variant }) => (
        <Card key={title} padding="m">
          <Flex justifyContent="space-between" alignItems="center">
            <strong>{title}</strong>
            <Tag variant={variant}>{status}</Tag>
          </Flex>
        </Card>
      ))}
    </Flex>`,
                preview: <FlexCardGridPreview />,
            }
];
