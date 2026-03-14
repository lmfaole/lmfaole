import { useState, useEffect } from "react";
import { BETA_Select as Select } from "@fremtind/jokul/select";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "select",
    name: "Select (beta)",
    package: "@fremtind/jokul/select",
    category: "Skjema",
    status: "beta",
    tags: ["input", "skjema", "interaktiv", "skjemabygging", "nedtrekksmeny"],
    description: "BETA_Select er en ny, forenklet variant av Select som wrapper det native <select>-elementet med Jøkul-styling. Den bruker children i stedet for en items-array og standard React onChange — i motsetning til den stabile Select som har et egendefinert dropdown-grensesnitt. Planen er at BETA_Select erstatter den stabile varianten.",
    relatedIds: ["select-stable", "radio-button", "autosuggest"],
    warnings: [
        "BETA_Select er ikke ferdigstilt og API-en kan endre seg. Den mangler searchable, maxShownOptions og den egendefinerte SelectChangeEventHandler fra stabil Select.",
    ],

    props,
    examples,
};

export default doc;
