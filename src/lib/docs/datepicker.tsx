import React from "react";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "datepicker",
    name: "DatePicker",
    package: "@fremtind/jokul/datepicker",
    category: "Skjema",
    description: "DatePicker er et datovelgerkomponent med kalendergrensesnitt og tekstinput i norsk datoformat (dd.mm.åååå).",
    notes: "Datoer håndteres i string-format dd.mm.åååå.",
    relatedIds: ["text-input"],
    props: [
        { name: "label", type: "string", required: false, default: '"Velg dato"', description: "Synlig label." },
        { name: "value", type: "string", required: false, description: "Valgt dato i dd.mm.åååå-format." },
        { name: "onChange", type: "(e, date, meta) => void", required: false, description: "Kalles ved datoendring." },
        { name: "disableBeforeDate", type: "string", required: false, description: "Deaktiver datoer før denne (dd.mm.åååå)." },
        { name: "disableAfterDate", type: "string", required: false, description: "Deaktiver datoer etter denne (dd.mm.åååå)." },
        { name: "errorLabel", type: "string", required: false, description: "Feilmelding." },
        { name: "helpLabel", type: "string", required: false, description: "Hjelpetekst." },
    ],
    examples: [
        {
            title: "Grunnleggende datovelger",
            description: "Kontrollert DatePicker med onChange-handler.",
            code: `const [date, setDate] = React.useState("");

<DatePicker
    label="Velg startdato"
    value={date}
    onChange={(_, dateValue) => setDate(dateValue ?? "")}
    helpLabel="Format: dd.mm.åååå"
/>`,
        },
    ],
};

export default doc;
