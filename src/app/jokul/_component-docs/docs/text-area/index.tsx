import type { ComponentDoc } from "../types";
import { props } from "./props";
import { TextAreaPreview } from "./preview";

const doc: ComponentDoc = {
    id: "text-area",
    name: "Text Area",
    package: "@fremtind/jokul/text-area",
    category: "Skjema",
    description: "TextArea er et flerlinjers tekstinputfelt for lengre tekstinnhold.",
    relationships: {
        related: [{ id: "text-input", description: "Bruk TextInput for enkeltlinjeverdi; TextArea er for flerlinjers fritekst som kommentarer eller beskrivelser." }],
    },
    preview: <TextAreaPreview />,

    props,
};

export default doc;
