import React from "react";
import { Card } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Tag } from "@fremtind/jokul/tag";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "card",
    name: "Card",
    package: "@fremtind/jokul/card",
    category: "Visning",
    tags: ["layout", "panel", "datavisning"],
    description: "Card er en overflate-komponent som grupperer relatert innhold i et visuelt avgrenset område. Den gir bakgrunn, ramme og padding via padding-proppen. Card gjør ikke antagelser om innhold — det er opp til deg å strukturere innholdet med Flex, overskrifter og andre komponenter.",
    notes: "Card er ikke interaktivt som standard. Bruk clickable + as=\"a\" for klikkbare kort, og sett alltid aria-label.",
    relatedIds: ["flex"],
    props: [
        {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: "Kortets innhold. Strukturer med Flex, overskrifter og andre komponenter.",
        },
        {
            name: "padding",
            type: '"s" | "m" | "l" | "xl"',
            required: false,
            default: '"s"',
            description: "Innvendig padding. Bruk l/xl for romslig innhold som fremhevede kort.",
        },
        {
            name: "variant",
            type: '"outlined" | "high" | "low"',
            required: false,
            default: '"high"',
            description: "Visuell variant. high gir sterk skygge, low svak skygge, outlined kantlinje uten skygge. Velg etter bakgrunnskontrast.",
        },
        {
            name: "clickable",
            type: "boolean",
            required: false,
            default: "false",
            description: "Markerer kortet visuelt som klikkbart (hover/fokus-effekter). Du må selv rendre kortet som et klikkbart element. Husk aria-label.",
        },
        {
            name: "as",
            type: "React.ElementType",
            required: false,
            default: '"div"',
            description: "Polymorf komponent — bytt ut rotelementet. Bruk as=\"a\" for klikkbare kort.",
        },
        {
            name: "className",
            type: "string",
            required: false,
            description: "Egendefinerte CSS-klasser.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende innholdskort",
            description: "Typisk mønster: Card med Flex-kolonne internt. Header øverst, innhold i midten, handlinger nederst.",
            tags: ["variant:high"],
            code: `<Card padding="l">
  <Flex direction="column" gap="s">
    <h2>Tittel på kortet</h2>
    <p>Beskrivelse av innholdet i dette kortet.</p>
    <Flex gap="s">
      <Button>Åpne</Button>
      <Button variant="ghost">Mer info</Button>
    </Flex>
  </Flex>
</Card>`,
            preview: (
                <Card padding="l">
                    <Flex direction="column" gap="s">
                        <h2>Tittel på kortet</h2>
                        <p>Beskrivelse av innholdet i dette kortet.</p>
                        <Flex gap="s">
                            <Button>Åpne</Button>
                            <Button variant="ghost">Mer info</Button>
                        </Flex>
                    </Flex>
                </Card>
            ),
        },
        {
            title: "Varianter: high, low og outlined",
            description: "high (standard) brukes på hvit bakgrunn, low på lys grå bakgrunn, outlined der du vil unngå skygge helt.",
            tags: ["variant"],
            code: `<Flex gap="m" wrap="wrap">
  <Card variant="high" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
    <strong>high</strong>
    <p className="muted">Sterk skygge. Bruk på hvit bakgrunn.</p>
  </Card>
  <Card variant="low" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
    <strong>low</strong>
    <p className="muted">Svak skygge. Bruk på lys grå bakgrunn.</p>
  </Card>
  <Card variant="outlined" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
    <strong>outlined</strong>
    <p className="muted">Kantlinje, ingen skygge.</p>
  </Card>
</Flex>`,
            preview: (
                <Flex gap="m" wrap="wrap">
                    <Card variant="high" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
                        <strong>high</strong>
                        <p className="muted" style={{ margin: 0 }}>Sterk skygge. Bruk på hvit bakgrunn.</p>
                    </Card>
                    <Card variant="low" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
                        <strong>low</strong>
                        <p className="muted" style={{ margin: 0 }}>Svak skygge. Bruk på lys grå bakgrunn.</p>
                    </Card>
                    <Card variant="outlined" padding="m" style={{ flex: 1, minWidth: "10rem" }}>
                        <strong>outlined</strong>
                        <p className="muted" style={{ margin: 0 }}>Kantlinje, ingen skygge.</p>
                    </Card>
                </Flex>
            ),
        },
        {
            title: "Klikkbart kort",
            description: "Bruk as=\"a\" og clickable for å gjøre hele kortet klikkbart. Sett aria-label så skjermleseren ikke leser alt innholdet.",
            tags: ["clickable", "interaktiv"],
            code: `<Flex gap="m" wrap="wrap">
  <Card as="a" href="/forsikringer/bilforsikring" clickable aria-label="Bilforsikring kasko">
    <Flex direction="column" gap="xs">
      <Flex justifyContent="space-between" alignItems="center">
        <strong>Bilforsikring</strong>
        <Tag variant="success">Aktiv</Tag>
      </Flex>
      <p className="muted">Kasko · Utløper 31.12.2026</p>
    </Flex>
  </Card>
  <Card as="a" href="/forsikringer/innbo" clickable aria-label="Innboforsikring">
    <Flex direction="column" gap="xs">
      <Flex justifyContent="space-between" alignItems="center">
        <strong>Innboforsikring</strong>
        <Tag variant="warning">Fornyes snart</Tag>
      </Flex>
      <p className="muted">Standard · Utløper 01.06.2026</p>
    </Flex>
  </Card>
</Flex>`,
            preview: (
                <Flex gap="m" wrap="wrap">
                    <Card as="a" href="#" clickable aria-label="Bilforsikring kasko" style={{ flex: 1, minWidth: "12rem" }}>
                        <Flex direction="column" gap="xs">
                            <Flex justifyContent="space-between" alignItems="center">
                                <strong>Bilforsikring</strong>
                                <Tag variant="success">Aktiv</Tag>
                            </Flex>
                            <p className="muted" style={{ margin: 0 }}>Kasko · Utløper 31.12.2026</p>
                        </Flex>
                    </Card>
                    <Card as="a" href="#" clickable aria-label="Innboforsikring" style={{ flex: 1, minWidth: "12rem" }}>
                        <Flex direction="column" gap="xs">
                            <Flex justifyContent="space-between" alignItems="center">
                                <strong>Innboforsikring</strong>
                                <Tag variant="warning">Fornyes snart</Tag>
                            </Flex>
                            <p className="muted" style={{ margin: 0 }}>Standard · Utløper 01.06.2026</p>
                        </Flex>
                    </Card>
                </Flex>
            ),
        },
        {
            title: "Detaljkort med oppsummering",
            description: "Kombiner Card med DescriptionList for å vise nøkkel-verdi-informasjon i et ryddig panel.",
            tags: ["composition"],
            code: `<Card padding="l" style={{ maxWidth: "28rem" }}>
  <Flex direction="column" gap="m">
    <Flex justifyContent="space-between" alignItems="center">
      <h2 style={{ margin: 0 }}>Bilforsikring kasko</h2>
      <Tag variant="success">Aktiv</Tag>
    </Flex>
    <DescriptionList>
      <DescriptionTerm>Registreringsnummer</DescriptionTerm>
      <DescriptionDetail>AB 12345</DescriptionDetail>
      <DescriptionTerm>Månedspremie</DescriptionTerm>
      <DescriptionDetail>542 kr</DescriptionDetail>
      <DescriptionTerm>Neste forfall</DescriptionTerm>
      <DescriptionDetail>15. april 2026</DescriptionDetail>
    </DescriptionList>
    <Flex gap="s">
      <Button>Endre dekning</Button>
      <Button variant="ghost">Meld skade</Button>
    </Flex>
  </Flex>
</Card>`,
            preview: (
                <Card padding="l" style={{ maxWidth: "28rem", width: "100%" }}>
                    <Flex direction="column" gap="m">
                        <Flex justifyContent="space-between" alignItems="center">
                            <h2 style={{ margin: 0 }}>Bilforsikring kasko</h2>
                            <Tag variant="success">Aktiv</Tag>
                        </Flex>
                        <DescriptionList>
                            <DescriptionTerm>Registreringsnummer</DescriptionTerm>
                            <DescriptionDetail>AB 12345</DescriptionDetail>
                            <DescriptionTerm>Månedspremie</DescriptionTerm>
                            <DescriptionDetail>542 kr</DescriptionDetail>
                            <DescriptionTerm>Neste forfall</DescriptionTerm>
                            <DescriptionDetail>15. april 2026</DescriptionDetail>
                        </DescriptionList>
                        <Flex gap="s">
                            <Button>Endre dekning</Button>
                            <Button variant="ghost">Meld skade</Button>
                        </Flex>
                    </Flex>
                </Card>
            ),
        },
    ],
};

export default doc;
