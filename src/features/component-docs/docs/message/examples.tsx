import { useState, useEffect } from "react";
import { Message } from "@fremtind/jokul/message";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const MESSAGE_VARIANTS = ["info", "success", "warning", "error"];


export const examples: ComponentExample[] = [
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
            }
];
