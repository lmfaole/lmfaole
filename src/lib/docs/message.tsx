import React from "react";
import { Message } from "@fremtind/jokul/message";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "message",
    name: "Message",
    package: "@fremtind/jokul/message",
    category: "Tilbakemelding",
    tags: ["feedback", "tilgjengelighet", "validering"],
    description: "Message viser kontekstuell informasjon, advarsler, suksessmeldinger og feilmeldinger til brukeren. Komponenten er tilgjengelig ut av boksen med riktig role og aria-attributter for alle varianter. Bruk riktig variant for å kommunisere alvorlighetsgraden av meldingen.",
    notes: "Ikke bruk Message for inline skjemafeil — bruk errorLabel på skjemakomponentene i stedet. Message passer best for meldinger som gjelder hele skjemaet eller siden, ikke enkeltfelt.",
    relatedIds: ["tag"],
    props: [
        { name: "variant", type: '"info" | "success" | "warning" | "error"', required: false, source: "custom", status: "stable", default: '"info"', description: "info: nøytral informasjon eller tips. success: bekreftelse på at noe gikk bra. warning: viktig informasjon brukeren bør lese. error: noe gikk galt og brukeren må gjøre noe." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Meldingsteksten." },
        { name: "title", type: "string", required: false, source: "react", status: "stable", description: "Valgfri overskrift i meldingen." },
        { name: "full", type: "boolean", required: false, source: "custom", status: "stable", default: "false", description: "Strekker meldingen til full bredde." },
        { name: "dismissed", type: "boolean", required: false, source: "custom", status: "stable", description: "Kontrollert tilstand for om meldingen er lukket." },
        { name: "onDismiss", type: "() => void", required: false, source: "react", status: "stable", description: "Klikk-handler for lukkeknappen." },
    ],
    examples: [
        {
            title: "Info-melding",
            description: "En enkel informasjonsmelding.",
            code: `<Message variant="info">Forsikringen din fornyes automatisk 1. januar.</Message>`,
            preview: <Message variant="info">Forsikringen din fornyes automatisk 1. januar.</Message>,
            tags: [],
        },
        {
            title: "Alle varianter",
            description: "Velg variant basert på innholdets natur.",
            code: `<Flex direction="column" gap="s">
  <Message variant="info">Skjemaet er under vedlikehold frem til klokken 14.</Message>
  <Message variant="success">Endringene dine ble lagret.</Message>
  <Message variant="warning">Du har ikke lagret de siste endringene.</Message>
  <Message variant="error">Noe gikk galt. Prøv igjen om litt.</Message>
</Flex>`,
            preview: (
                <Flex direction="column" gap="s">
                    <Message variant="info">Skjemaet er under vedlikehold frem til klokken 14.</Message>
                    <Message variant="success">Endringene dine ble lagret.</Message>
                    <Message variant="warning">Du har ikke lagret de siste endringene.</Message>
                    <Message variant="error">Noe gikk galt. Prøv igjen om litt.</Message>
                </Flex>
            ),
        },
        {
            title: "Med tittel",
            description: "Legg til title når meldingen er lang nok til å trenge struktur.",
            code: `<Message variant="warning" title="Utløpende sesjon">
  Du vil bli logget ut om 5 minutter på grunn av inaktivitet.
</Message>`,
            preview: (
                <Message variant="warning" title="Utløpende sesjon">
                    Du vil bli logget ut om 5 minutter på grunn av inaktivitet.
                </Message>
            ),
        },
        {
            title: "Full bredde",
            description: "Bruk fullWidth for meldinger som skal dekke hele sidebredden, f.eks. global systemstatus.",
            code: `<Message variant="error" title="Tjenesten er nede" fullWidth>
  Vi opplever for øyeblikket tekniske problemer. Prøv igjen om noen minutter.
</Message>`,
            preview: (
                <Message variant="error" title="Tjenesten er nede" fullWidth>
                    Vi opplever for øyeblikket tekniske problemer. Prøv igjen om noen minutter.
                </Message>
            ),
        },
    ],
};

export default doc;
