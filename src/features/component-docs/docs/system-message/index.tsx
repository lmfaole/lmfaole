import { useState, useEffect } from "react";
import { SystemMessage } from "@fremtind/jokul/system-message";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

const doc: ComponentDoc = {
    id: "system-message",
    name: "System Message",
    package: "@fremtind/jokul/system-message",
    category: "Tilbakemelding",
    status: "stable",
    description:
        "SystemMessage brukes til å kommunisere viktig informasjon til brukeren på sidenivå. Finnes i variantene info, success, warning og error. Kan gjøres avvisbar med dismissAction.",
    warnings: [
        "Bruk role='alert' på kritiske meldinger som vises dynamisk — uten det annonserer ikke skjermlesere dem automatisk.",
        "InfoSystemMessage, SuccessSystemMessage, WarningSystemMessage og ErrorSystemMessage er utfaset. Bruk <SystemMessage variant=\"...\"> i stedet.",
    ],
    relationships: {
        alternatives: [{ id: "message", description: "Bruk Message for vedvarende innebygd tilbakemelding innenfor en sideseksjon fremfor et banner i full bredde." }, { id: "toast", description: "Bruk Toast for korte selvlukkende varsler som vises i kanten av skjermen." }],
    },

    props,
    examples,
    migrations,
};

export default doc;
