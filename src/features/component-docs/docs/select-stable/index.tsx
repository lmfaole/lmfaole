import { useState, useEffect } from "react";
import { Select } from "@fremtind/jokul/select";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

const doc: ComponentDoc = {
    id: "select-stable",
    name: "Select",
    package: "@fremtind/jokul/select",
    category: "Skjema",
    status: "stable",
    description: "Select er nedtrekksmenyen med egendefinert dropdown-grensesnitt. Den tar en items-array og har sin egen SelectChangeEventHandler. En ny, forenklet variant — BETA_Select — er under utvikling og vil erstatte denne over tid.",
    siblingIds: ["select"],
    relatedIds: ["radio-button", "autosuggest"],
    warnings: [
        "BETA_Select er den anbefalte veien videre. Se migreringsveiledningen nedenfor for å komme i gang.",
    ],

    props,
    examples,
    migrations,
};

export default doc;
