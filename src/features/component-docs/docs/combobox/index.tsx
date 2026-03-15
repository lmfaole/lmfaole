import { useState, useEffect } from "react";
import { Combobox } from "@fremtind/jokul/combobox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { ComboboxBasicPreview } from "./examples";

const doc: ComponentDoc = {
    id: "combobox",
    name: "Combobox",
    package: "@fremtind/jokul/combobox",
    category: "Skjema",
    status: "stable",
    description:
        "Combobox er et flervalg-skjemaelement med søkefunksjon. Valgte elementer vises som chips og kan fjernes enkeltvis.",
    relationships: {
        related: [{ id: "select", description: "Bruk Select når ingen fritekstinntasting er nødvendig og listen er liten nok til å bla gjennom." }, { id: "autosuggest", description: "Autosuggest ligner, men støtter ikke flervalg; bruk Combobox når flere verdier må velges." }],
    },
    preview: <ComboboxBasicPreview />,

    props,
    examples,
};

export default doc;
