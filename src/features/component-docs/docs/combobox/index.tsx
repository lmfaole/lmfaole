import { useState, useEffect } from "react";
import { Combobox } from "@fremtind/jokul/combobox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { ComboboxBasicPreview } from "./examples";
import selectDoc from "../select";
import autosuggestDoc from "../autosuggest";

const doc: ComponentDoc = {
    id: "combobox",
    name: "Combobox",
    package: "@fremtind/jokul/combobox",
    category: "Skjema",
    tags: ["multi-select", "chips", "søk", "input", "skjema", "kontrollert"],
    status: "stable",
    description:
        "Combobox er et flervalg-skjemaelement med søkefunksjon. Valgte elementer vises som chips og kan fjernes enkeltvis.",
    relatedIds: [selectDoc.id, autosuggestDoc.id],
    preview: <ComboboxBasicPreview />,

    props,
    examples,
};

export default doc;
