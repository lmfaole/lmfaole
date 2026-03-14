import { useState, useEffect } from "react";
import { Autosuggest } from "@fremtind/jokul/autosuggest";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";
import { AutosuggestPreview } from "./examples";
import textInputDoc from "../text-input";
import selectDoc from "../select";

const doc: ComponentDoc = {
    id: "autosuggest",
    name: "Autosuggest",
    package: "@fremtind/jokul/autosuggest",
    category: "Skjema",
    tags: ["input", "skjema", "søk", "interaktiv", "kontrollert"],
    description: "Autosuggest er et tekstinputfelt som viser forslag mens brukeren skriver. Passer for søk og fritekstfelt med et endelig sett av gyldige valg.",
    warnings: "Forslagene filtreres ikke automatisk — du håndterer filtrering selv og oppdaterer suggestions-prop.",
    relatedIds: [textInputDoc.id, selectDoc.id],
    preview: <AutosuggestPreview />,

    props,
    examples,
    migrations,
};

export default doc;
