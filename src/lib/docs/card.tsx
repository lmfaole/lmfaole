import React from "react";
import { Card } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Tag } from "@fremtind/jokul/tag";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "card",
    name: "Card",
    package: "@fremtind/jokul/card",
    category: "Visning",
    description: "Card er en overflate-komponent som grupperer relatert innhold i et visuelt avgrenset område. Den gir bakgrunn, ramme og padding via padding-proppen. Card gjør ikke antagelser om innhold — det er opp til deg å strukturere innholdet med Flex, overskrifter og andre komponenter.",
    notes: "Card er ikke interaktivt som standard. Hvis hele kortet skal være klikkbart, legg til en Link-komponent rundt eller bruk onClick på Card med role=\"button\". Ikke misbruk Card for all strukturering — bruk section-elementer og CSS for enklere grupperinger.",
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
            type: '"none" | "s" | "m" | "l" | "xl"',
            required: false,
            default: '"m"',
            description: "Innvendig padding. none for full-bleed innhold (bilder etc.), l og xl for romslig innhold som fremhevede kort.",
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
            description: "Typisk mønster: Card med Flex-kolonne internt. Legg header-informasjon øverst, primærinnhold i midten, handlinger nederst.",
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
            title: "Statuskort",
            description: "Bruk Tags og Message inne i Card for å kommunisere tilstand.",
            code: `<Card padding="m">
  <Flex direction="column" gap="xs">
    <Flex justifyContent="space-between" alignItems="start">
      <strong>Forsikringsavtale #12345</strong>
      <Tag variant="success">Aktiv</Tag>
    </Flex>
    <p className="muted">Utløper 31. desember 2026</p>
  </Flex>
</Card>`,
            preview: (
                <Card padding="m">
                    <Flex direction="column" gap="xs">
                        <Flex justifyContent="space-between" alignItems="start">
                            <strong>Forsikringsavtale #12345</strong>
                            <Tag variant="success">Aktiv</Tag>
                        </Flex>
                        <p className="muted">Utløper 31. desember 2026</p>
                    </Flex>
                </Card>
            ),
        },
    ],
};

export default doc;
