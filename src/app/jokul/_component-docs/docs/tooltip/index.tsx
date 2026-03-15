import type { ComponentDoc } from "../types";
import { props } from "./props";
import { TooltipPreview } from "./preview";

const doc: ComponentDoc = {
    id: "tooltip",
    name: "Tooltip",
    package: "@fremtind/jokul/tooltip",
    category: "Overlegg",
    description: "Tooltip og PopupTip viser tilleggsinformasjon ved hover eller klikk.",
    warnings: [
    "Ikke legg Tooltip på ikke-interaktive elementer — det er ikke tilgjengelig for tastaturbrukere.",
    "Tooltip må aldri inneholde kritisk informasjon som ikke finnes andre steder på siden.",
],
    preview: <TooltipPreview />,
    props,
};

export default doc;
