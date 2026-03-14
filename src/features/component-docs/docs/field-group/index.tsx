import { useState, useEffect } from "react";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Checkbox } from "@fremtind/jokul/checkbox";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import checkboxDoc from "../checkbox";
import radioButtonDoc from "../radio-button";

const doc: ComponentDoc = {
    id: "field-group",
    name: "Field Group",
    package: "@fremtind/jokul/input-group",
    category: "Skjema",
    tags: ["skjema", "skjemabygging", "tilgjengelighet", "validering"],
    description: "FieldGroup grupperer relaterte skjemaelementer under en felles legend.",
    warnings: "Grupper alltid Checkbox og RadioButton innenfor FieldGroup — uten det mangler skjermlesere kontekst for hva gruppen handler om.",
    relatedIds: [checkboxDoc.id, radioButtonDoc.id],

    props,
    examples,
};

export default doc;
