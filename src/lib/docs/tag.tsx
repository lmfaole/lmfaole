import React from "react";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { CardDetailPreview } from "./card";
import { FlexCardGridPreview } from "./flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "tag",
    name: "Tag",
    package: "@fremtind/jokul/tag",
    category: "Visning",
    tags: ["tekst", "datavisning", "feedback"],
    description: "Tag brukes til å vise kategorier, statuser og etiketter. De er kun visuelle elementer — ikke bruk Tag som knapper eller lenker. For klikkbare filtre, bruk Chip-komponenten i stedet.",
    notes: "Tags er dekorative og ikke interaktive. Sørg for at taggteksten gir mening uten ekstra kontekst.",
    relatedIds: ["message"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Etikettteksten. Hold den kort — maks 3–4 ord." },
        { name: "variant", type: '"neutral" | "info" | "success" | "warning" | "error"', required: false, source: "react", status: "stable", default: '"neutral"', description: "Fargevarianten." },
    ],
    examples: [
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
        },
    ],
};

export default doc;
