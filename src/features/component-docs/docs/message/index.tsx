import { useState, useEffect } from "react";
import { Message } from "@fremtind/jokul/message";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "message",
    name: "Message",
    package: "@fremtind/jokul/message",
    category: "Tilbakemelding",
    description: "Message viser kontekstuell informasjon, advarsler, suksessmeldinger og feilmeldinger til brukeren. Komponenten er tilgjengelig ut av boksen med riktig role og aria-attributter for alle varianter. Bruk riktig variant for å kommunisere alvorlighetsgraden av meldingen.",
    warnings: "Ikke bruk Message for inline skjemafeil — bruk errorLabel på skjemakomponentene i stedet. Message passer best for meldinger som gjelder hele skjemaet eller siden, ikke enkeltfelt.",
    siblingIds: ["system-message", "toast"],
    relatedIds: ["tag"],

    props,
    examples,
};

export default doc;
