import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Message } from "@fremtind/jokul/message";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "flex",
    name: "Flex",
    package: "@fremtind/jokul/flex",
    category: "Layout",
    description: "Flex er den primære layout-primitiven i Jøkul. Den lar deg bygge flexbox-layouts med Jøkuls spacing-skala for gap, uten å skrive CSS. Komponenten rendres som div som standard, men kan rendres som et hvilket som helst HTML-element via as-proppen.",
    notes: "Flex er ikke ment å erstatte alle layout-behov. For todimensjonale layouts, bruk CSS Grid.",
    relatedIds: ["button", "tag"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, description: "Innholdet som skal layoutes." },
        { name: "direction", type: '"row" | "column" | "row-reverse" | "column-reverse"', required: false, default: '"row"', description: "Retningen barn-elementene plasseres." },
        { name: "gap", type: '"none" | "xxs" | "xs" | "s" | "m" | "l" | "xl"', required: false, default: '"none"', description: "Avstand mellom barn-elementene. Bruker Jøkuls spacing-skala." },
        { name: "wrap", type: '"nowrap" | "wrap" | "wrap-reverse"', required: false, default: '"nowrap"', description: "wrap lar barn-elementene bryte over på ny linje." },
        { name: "alignItems", type: '"normal" | "start" | "center" | "end" | "baseline" | "stretch"', required: false, default: '"stretch"', description: "Justering langs kryssaksen." },
        { name: "justifyContent", type: "string", required: false, default: '"flex-start"', description: "Distribusjon langs hovedaksen." },
        { name: "as", type: "React.ElementType", required: false, default: '"div"', description: "HTML-elementtypen som rendres." },
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
    ],
};

export default doc;
