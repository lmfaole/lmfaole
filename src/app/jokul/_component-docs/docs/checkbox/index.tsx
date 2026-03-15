import type { ComponentDoc } from "../types";
import { props } from "./props";
import { CheckboxPreview } from "./preview";

const doc: ComponentDoc = {
    id: "checkbox",
    name: "Checkbox",
    package: "@fremtind/jokul/checkbox",
    category: "Skjema",
    description: {
        short: "Brukes for binære valg i skjemaer typisk for samtykke eller.",
        long: "Checkbox brukes for binære valg i skjemaer, typisk for samtykke eller flervalgslister.",
    },
    warnings: "Bruk ToggleSwitch for innstillinger som trer i kraft umiddelbart — Checkbox er for skjemainnsending.",
    relationships: {
        alternatives: [{ id: "checkbox-panel", description: "Bruk CheckboxPanel når du trenger et større klikkbart kortområde som inkluderer etiketten." }],
        related: [
            { id: "input-group", description: "Bruk InputGroup for å gruppere Checkbox-felter under en felles label og dele hjelpetekst." },
            { id: "toggle-switch", description: "Bruk ToggleSwitch for binære av/på-innstillinger som trer i kraft umiddelbart uten en innsendingshandling." },
        ],
    },

    preview: <CheckboxPreview />,
    props,
};

export default doc;
