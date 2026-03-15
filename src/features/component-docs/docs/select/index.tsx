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
    description: "BETA_Select er en ny, forenklet variant av Select som wrapper det native <select>-elementet med Jøkul-styling. Den bruker children i stedet for en items-array og standard React onChange — i motsetning til den stabile Select som har et egendefinert dropdown-grensesnitt. Planen er at BETA_Select erstatter den stabile varianten.",
    relationships: {
        alternatives: [{ id: "select-stable", description: "Bruk den stabile Select (SelectStable) i produksjon inntil denne BETA-komponentens API er ferdigstilt." }],
        related: [{ id: "radio-button", description: "Bruk RadioButton når det er få alternativer og du vil at de alltid skal være synlige uten nedtrekksliste." }, { id: "autosuggest", description: "Kombiner med Autosuggest når brukeren trenger å skrive-filtrere en svært lang liste med alternativer." }],
    },
    warnings: [
        "BETA_Select er ikke ferdigstilt og API-en kan endre seg. Den mangler searchable, maxShownOptions og den egendefinerte SelectChangeEventHandler fra stabil Select.",
    ],

    props,
    examples
};

export default doc;
