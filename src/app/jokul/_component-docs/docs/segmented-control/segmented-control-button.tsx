import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "segmented-control-button",
    name: "SegmentedControlButton",
    package: "@fremtind/jokul/segmented-control",
    category: "Handling",
    standalone: false,
    description: "Et enkelt alternativ i SegmentedControl.",
    preview: null as any,
    props: [
        { name: "value", type: "string", required: true, source: "native", status: "stable", description: "Verdien som sendes ved valg." },
        { name: "checked", type: "boolean", required: false, source: "native", status: "stable", description: "Om dette alternativet er valgt (kontrollert)." },
        { name: "onChange", type: "React.ChangeEventHandler<HTMLInputElement>", required: false, source: "react", status: "stable", description: "Kalles når alternativet velges." },
        { name: "disabled", type: "boolean", required: false, source: "native", status: "stable", default: "false", description: "Deaktiverer alternativet." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold i knappen." },
    ],
};

export default doc;
