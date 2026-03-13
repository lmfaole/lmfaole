import React from "react";
import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "button",
    name: "Button",
    package: "@fremtind/jokul/button",
    category: "Skjema",
    tags: ["knapp", "interaktiv", "skjema"],
    description: "Button brukes til å utløse handlinger. Knapper er det primære interaksjonselementet og skal alltid kommunisere hva som skjer når brukeren trykker på dem. Velg variant basert på handlingens prioritet — bruk én primary-knapp per kontekst og reserver ghost for lavprioriterte handlinger.",
    notes: "Ikke bruk Button til navigasjon — bruk Link eller NavLink i stedet. En knapp skal alltid ha en tydelig, handlingsrettet label. Unngå «Klikk her» eller «Send» uten kontekst.",
    relatedIds: ["text-input", "toggle-switch"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, description: "Tekstinnholdet i knappen." },
        { name: "variant", type: '"primary" | "secondary" | "ghost" | "tertiary"', required: false, default: '"primary"', description: "Visuell prioritet." },
        { name: "loader", type: "{ showLoader: boolean, textDescription: string }", required: false, description: "Viser lasteindikator i knappen." },
        { name: "disabled", type: "boolean", required: false, default: "false", description: "Deaktiverer knappen." },
        { name: "type", type: '"button" | "submit" | "reset"', required: false, default: '"button"', description: "HTML-type-attributtet." },
        { name: "onClick", type: "React.MouseEventHandler<HTMLButtonElement>", required: false, description: "Klikk-handler." },
    ],
    examples: [
        {
            title: "Varianter",
            description: "Bruk primary for den viktigste handlingen. secondary og ghost brukes for støttehandlinger.",
            code: `<Flex gap="s" wrap="wrap">
  <Button variant="primary">Lagre endringer</Button>
  <Button variant="secondary">Avbryt</Button>
  <Button variant="ghost">Slett</Button>
  <Button variant="tertiary">Vis mer</Button>
</Flex>`,
            preview: (
                <Flex gap="s" wrap="wrap">
                    <Button variant="primary">Lagre endringer</Button>
                    <Button variant="secondary">Avbryt</Button>
                    <Button variant="ghost">Slett</Button>
                    <Button variant="tertiary">Vis mer</Button>
                </Flex>
            ),
        },
        {
            title: "Lasteindikator",
            description: "Bruk loader når en handling tar tid. Gi alltid textDescription for skjermlesere.",
            code: `<Button loader={{ showLoader: true, textDescription: "Lagrer endringer" }}>
  Lagrer…
</Button>`,
            preview: (
                <Button loader={{ showLoader: true, textDescription: "Lagrer endringer" }}>
                    Lagrer…
                </Button>
            ),
        },
        {
            title: "Deaktivert tilstand",
            description: "Bruk disabled med varsomhet.",
            code: `<Flex gap="s">
  <Button disabled>Kan ikke lagres</Button>
  <Button variant="secondary" disabled>Slett</Button>
</Flex>`,
            tags: ["disabled"],
            preview: (
                <Flex gap="s">
                    <Button disabled>Kan ikke lagres</Button>
                    <Button variant="secondary" disabled>Slett</Button>
                </Flex>
            ),
        },
    ],
};

export default doc;
