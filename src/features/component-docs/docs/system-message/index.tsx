import { useState, useEffect } from "react";
import { SystemMessage } from "@fremtind/jokul/system-message";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";
import messageDoc from "../message";
import toastDoc from "../toast";

const doc: ComponentDoc = {
    id: "system-message",
    name: "System Message",
    package: "@fremtind/jokul/system-message",
    category: "Tilbakemelding",
    tags: ["melding", "varsel", "feil", "info", "suksess", "advarsel"],
    status: "stable",
    description:
        "SystemMessage brukes til å kommunisere viktig informasjon til brukeren på sidenivå. Finnes i variantene info, success, warning og error. Kan gjøres avvisbar med dismissAction.",
    warnings: [
        "Bruk role='alert' på kritiske meldinger som vises dynamisk — uten det annonserer ikke skjermlesere dem automatisk.",
        "InfoSystemMessage, SuccessSystemMessage, WarningSystemMessage og ErrorSystemMessage er utfaset. Bruk <SystemMessage variant=\"...\"> i stedet.",
    ],
    relatedIds: [messageDoc.id, toastDoc.id],

    props,
    examples,
    migrations,
};

export default doc;
