import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Message } from "@fremtind/jokul/message";
import { Tag } from "@fremtind/jokul/tag";
import { TextInput } from "@fremtind/jokul/text-input";
import { Card } from "@fremtind/jokul/card";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "flex",
    name: "Flex",
    package: "@fremtind/jokul/flex",
    category: "Layout",
    tags: ["layout", "responsiv"],
    description: "Flex er den primære layout-primitiven i Jøkul. Den lar deg bygge flexbox-layouts med Jøkuls spacing-skala for gap, uten å skrive CSS. Komponenten rendres som div som standard, men kan rendres som et hvilket som helst HTML-element via as-proppen.",
    notes: "Flex er ikke ment å erstatte alle layout-behov. For todimensjonale layouts, bruk CSS Grid.",
    relatedIds: ["button", "tag"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", description: "Innholdet som skal layoutes." },
        { name: "direction", type: '"row" | "column" | "row-reverse" | "column-reverse"', required: false, source: "custom", default: '"row"', description: "Retningen barn-elementene plasseres." },
        { name: "gap", type: '"none" | "xxs" | "xs" | "s" | "m" | "l" | "xl"', required: false, source: "custom", default: '"none"', description: "Avstand mellom barn-elementene. Bruker Jøkuls spacing-skala." },
        { name: "wrap", type: '"nowrap" | "wrap" | "wrap-reverse"', required: false, source: "custom", default: '"nowrap"', description: "wrap lar barn-elementene bryte over på ny linje." },
        { name: "alignItems", type: '"normal" | "start" | "center" | "end" | "baseline" | "stretch"', required: false, source: "custom", default: '"stretch"', description: "Justering langs kryssaksen." },
        { name: "justifyContent", type: "string", required: false, source: "custom", default: '"flex-start"', description: "Distribusjon langs hovedaksen." },
        { name: "as", type: "React.ElementType", required: false, source: "custom", default: '"div"', description: "HTML-elementtypen som rendres." },
    ],
    examples: [
        {
            title: "Horisontal rad",
            description: "Standard: barn plasseres side om side.",
            code: `<Flex gap="m" alignItems="center">
  <Button variant="primary">Lagre</Button>
  <Button variant="secondary">Avbryt</Button>
  <Button variant="ghost">Tilbakestill</Button>
</Flex>`,
            preview: (
                <Flex gap="m" alignItems="center">
                    <Button variant="primary">Lagre</Button>
                    <Button variant="secondary">Avbryt</Button>
                    <Button variant="ghost">Tilbakestill</Button>
                </Flex>
            ),
        },
        {
            title: "Vertikal stabel",
            description: 'direction="column" for vertikale stacker.',
            code: `<Flex direction="column" gap="m">
  <Message variant="info">Husk å lagre før du lukker.</Message>
  <Flex gap="s">
    <Button>Lagre og lukk</Button>
    <Button variant="secondary">Avbryt</Button>
  </Flex>
</Flex>`,
            preview: (
                <Flex direction="column" gap="m">
                    <Message variant="info">Husk å lagre før du lukker.</Message>
                    <Flex gap="s">
                        <Button>Lagre og lukk</Button>
                        <Button variant="secondary">Avbryt</Button>
                    </Flex>
                </Flex>
            ),
        },
        {
            title: "Semantisk element",
            description: "Bruk as for å unngå overflødige wrapper-elementer.",
            code: `<Flex as="main" direction="column" gap="xl">
  <h1>Sidetittel</h1>
  <p>Innhold</p>
</Flex>`,
        },
        {
            title: "Fordeling med space-between",
            description: 'justifyContent="space-between" for topp-/bunntekst-mønster.',
            code: `<Flex justifyContent="space-between" alignItems="center">
  <span>Venstre innhold</span>
  <Button variant="ghost">Rediger</Button>
</Flex>`,
            preview: (
                <Flex justifyContent="space-between" alignItems="center">
                    <span>Venstre innhold</span>
                    <Button variant="ghost">Rediger</Button>
                </Flex>
            ),
        },
        {
            title: "Skjema-layout med felter og handlingsknapper",
            description: "Kombiner direction=\"column\" med en innebygd Flex-rad for å lage typisk skjemalayout med feltstabler og knapper i bunnen.",
            code: `<Flex as="form" direction="column" gap="l">
  <Flex direction="column" gap="m">
    <TextInput label="Fornavn" autoComplete="given-name" />
    <TextInput label="Etternavn" autoComplete="family-name" />
    <TextInput label="E-postadresse" type="email" autoComplete="email" />
  </Flex>
  <Message variant="info">
    Vi deler aldri e-postadressen din med tredjeparter.
  </Message>
  <Flex gap="s" wrap="wrap">
    <Button type="submit" variant="primary">Registrer</Button>
    <Button type="reset" variant="secondary">Nullstill</Button>
  </Flex>
</Flex>`,
            preview: (
                <Flex as="form" direction="column" gap="l">
                    <Flex direction="column" gap="m">
                        <TextInput label="Fornavn" autoComplete="given-name" />
                        <TextInput label="Etternavn" autoComplete="family-name" />
                        <TextInput label="E-postadresse" type="email" autoComplete="email" />
                    </Flex>
                    <Message variant="info">
                        Vi deler aldri e-postadressen din med tredjeparter.
                    </Message>
                    <Flex gap="s" wrap="wrap">
                        <Button type="submit" variant="primary">Registrer</Button>
                        <Button type="reset" variant="secondary">Nullstill</Button>
                    </Flex>
                </Flex>
            ),
        },
        {
            title: "Kortoversikt med metadata",
            description: "Wrap-rad med kort. Illustrerer gap + wrap + nestede kolonner for listevisning.",
            code: `<Flex gap="m" wrap="wrap">
  {[
    { title: "Bilforsikring", status: "Aktiv", due: "31.12.2025", variant: "success" },
    { title: "Hjemforsikring", status: "Aktiv", due: "01.06.2026", variant: "success" },
    { title: "Reiseforsikring", status: "Utløpt", due: "01.01.2025", variant: "error" },
  ].map(({ title, status, due, variant }) => (
    <Card key={title} padding="m" style={{ minWidth: 200, flex: "1 1 200px" }}>
      <Flex direction="column" gap="xs">
        <Flex justifyContent="space-between" alignItems="center">
          <strong>{title}</strong>
          <Tag variant={variant}>{status}</Tag>
        </Flex>
        <span style={{ fontSize: "0.9em" }}>Forfall: {due}</span>
        <Button variant="ghost" style={{ alignSelf: "flex-start" }}>
          Se detaljer
        </Button>
      </Flex>
    </Card>
  ))}
</Flex>`,
            preview: (
                <Flex gap="m" wrap="wrap">
                    {[
                        { title: "Bilforsikring", status: "Aktiv", due: "31.12.2025", variant: "success" as const },
                        { title: "Hjemforsikring", status: "Aktiv", due: "01.06.2026", variant: "success" as const },
                        { title: "Reiseforsikring", status: "Utløpt", due: "01.01.2025", variant: "error" as const },
                    ].map(({ title, status, due, variant }) => (
                        <Card key={title} padding="m" style={{ minWidth: 200, flex: "1 1 200px" }}>
                            <Flex direction="column" gap="xs">
                                <Flex justifyContent="space-between" alignItems="center">
                                    <strong>{title}</strong>
                                    <Tag variant={variant}>{status}</Tag>
                                </Flex>
                                <span style={{ fontSize: "0.9em" }}>Forfall: {due}</span>
                                <Button variant="ghost" style={{ alignSelf: "flex-start" }}>
                                    Se detaljer
                                </Button>
                            </Flex>
                        </Card>
                    ))}
                </Flex>
            ),
        },
        {
            title: "Responsiv navigasjonslinje",
            description: "justifyContent=\"space-between\" kombinert med nestede Flex-rader for en typisk header-layout med logo til venstre og handlinger til høyre.",
            code: `<Flex
  as="nav"
  justifyContent="space-between"
  alignItems="center"
  gap="m"
  style={{ padding: "1rem", background: "var(--jkl-color-background-container)" }}
>
  <Flex alignItems="center" gap="s">
    <strong>MinSide</strong>
    <Tag variant="info">Beta</Tag>
  </Flex>
  <Flex gap="xs" wrap="wrap">
    <Button variant="ghost">Oversikt</Button>
    <Button variant="ghost">Forsikringer</Button>
    <Button variant="ghost">Skademeldinger</Button>
    <Button variant="secondary">Logg inn</Button>
  </Flex>
</Flex>`,
            preview: (
                <Flex
                    as="nav"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="m"
                    style={{ padding: "1rem", background: "var(--jkl-color-background-container)" }}
                >
                    <Flex alignItems="center" gap="s">
                        <strong>MinSide</strong>
                        <Tag variant="info">Beta</Tag>
                    </Flex>
                    <Flex gap="xs" wrap="wrap">
                        <Button variant="ghost">Oversikt</Button>
                        <Button variant="ghost">Forsikringer</Button>
                        <Button variant="ghost">Skademeldinger</Button>
                        <Button variant="secondary">Logg inn</Button>
                    </Flex>
                </Flex>
            ),
        },
    ],
};

export default doc;
