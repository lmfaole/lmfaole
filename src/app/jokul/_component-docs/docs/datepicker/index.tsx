import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";
import { DatePickerPreview } from "./preview";

const doc: ComponentDoc = {
    id: "datepicker",
    name: "Date Picker",
    package: "@fremtind/jokul/datepicker",
    category: "Skjema",
    status: "stable",
    description:
        "DatePicker er et skjemafelt for å velge en dato. Den kombinerer et tekstfelt med en interaktiv kalender og validerer datoformatet automatisk.",
    warnings: "Verdien leveres som string i dd.mm.yyyy-format, ikke ISO — ta høyde for dette ved skjemainnsending.",
    relationships: {
        related: [{ id: "text-input", description: "DatePicker bruker TextInput som triggerfelt for manuell datoregistrering." }, { id: "select", description: "Bruk Select for enkle måneds-/årsnedfellslister når en full kalendervelger er unødvendig." }],
    },
    preview: <DatePickerPreview />,

    props,
    migrations,
};

export default doc;
