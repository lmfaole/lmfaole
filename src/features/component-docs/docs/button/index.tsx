import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";
import textInputDoc from "../text-input";
import toggleSwitchDoc from "../toggle-switch";
import iconButtonDoc from "../icon-button";
import iconDoc from "../icon";

const doc: ComponentDoc = {
    id: "button",
    name: "Button",
    package: "@fremtind/jokul/button",
    category: "Handling",
    tags: ["knapp", "interaktiv", "skjema"],
    description: "Button brukes til å utløse handlinger. Knapper er det primære interaksjonselementet og skal alltid kommunisere hva som skjer når brukeren trykker på dem. Velg variant basert på handlingens prioritet — bruk én primary-knapp per kontekst og reserver ghost for lavprioriterte handlinger.",
    warnings: "Ikke bruk Button til navigasjon — bruk Link eller NavLink i stedet.",
    relatedIds: [textInputDoc.id, toggleSwitchDoc.id, iconButtonDoc.id, iconDoc.id],

    props,
    examples,
    migrations,
};

export default doc;
