import React, { useState } from "react";
import { DatePicker } from "@fremtind/jokul/datepicker";
import type { ComponentDoc } from "./types";

function DatePickerBasicPreview() {
    return <DatePicker label="Velg dato" onChange={() => {}} />;
}

function toDateString(d: Date): string {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
}

function DatePickerBoundsPreview() {
    const today = new Date();
    const minus30 = new Date(today);
    minus30.setDate(today.getDate() - 30);
    const plus30 = new Date(today);
    plus30.setDate(today.getDate() + 30);

    return (
        <DatePicker
            label="Velg dato"
            disableBeforeDate={toDateString(minus30)}
            disableAfterDate={toDateString(plus30)}
            onChange={() => {}}
        />
    );
}

function DatePickerErrorPreview() {
    const [value, setValue] = useState("");

    return (
        <DatePicker
            label="Fødselsdato"
            value={value}
            onChange={(_e, _date, meta) => setValue(meta.value)}
            errorLabel="Ugyldig dato"
        />
    );
}

const doc: ComponentDoc = {
    id: "datepicker",
    name: "DatePicker",
    package: "@fremtind/jokul/datepicker",
    category: "Skjema",
    tags: ["dato", "input", "skjema", "kalender", "kontrollert"],
    status: "stable",
    description:
        "DatePicker er et skjemafelt for å velge en dato. Den kombinerer et tekstfelt med en interaktiv kalender og validerer datoformatet automatisk.",
    relatedIds: ["text-input", "select"],
    props: [
        {
            name: "label",
            type: "string",
            required: false,
            source: "custom",
            default: '"Velg dato"',
            description: "Label som vises over datofelet.",
        },
        {
            name: "onChange",
            type: '(e: ChangeEvent<HTMLInputElement>, date: Date | null, meta: { error: "WRONG_FORMAT" | "OUTSIDE_LOWER_BOUND" | "OUTSIDE_UPPER_BOUND" | null, value: string }) => void',
            required: false,
            source: "react",
            description: "Kalles ved endring. Motta dato og evt. feilkode.",
        },
        {
            name: "value",
            type: "string",
            required: false,
            source: "native",
            description: "Kontrollert verdi (ISO-datostreng).",
        },
        {
            name: "defaultValue",
            type: "string",
            required: false,
            source: "native",
            description: "Ukontrollert startverdi.",
        },
        {
            name: "helpLabel",
            type: "string",
            required: false,
            source: "custom",
            description: "Hjelpetekst under feltet.",
        },
        {
            name: "errorLabel",
            type: "string",
            required: false,
            source: "custom",
            description: "Feilmelding som vises under feltet.",
        },
        {
            name: "disableBeforeDate",
            type: "string",
            required: false,
            source: "custom",
            description: "Deaktiverer datoer før denne datoen i kalenderen (format: 'DD.MM.YYYY').",
        },
        {
            name: "disableAfterDate",
            type: "string",
            required: false,
            source: "custom",
            description: "Deaktiverer datoer etter denne datoen i kalenderen (format: 'DD.MM.YYYY').",
        },
        {
            name: "showCalendarLabel",
            type: "string",
            required: false,
            source: "custom",
            description: "Tilgjengelig label for å åpne kalenderen.",
        },
        {
            name: "hideCalendarLabel",
            type: "string",
            required: false,
            source: "custom",
            description: "Tilgjengelig label for å lukke kalenderen.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende bruk",
            description: "En ukontrollert DatePicker med standardlabel.",
            code: `import { DatePicker } from "@fremtind/jokul/datepicker";

<DatePicker label="Velg dato" onChange={() => {}} />`,
            preview: <DatePickerBasicPreview />,
        },
        {
            title: "Med grenser",
            description: "Begrens valgbare datoer til et intervall rundt dagens dato (±30 dager).",
            code: `import { DatePicker } from "@fremtind/jokul/datepicker";

function DatePickerWithBounds() {
    const today = new Date();
    const minus30 = new Date(today);
    minus30.setDate(today.getDate() - 30);
    const plus30 = new Date(today);
    plus30.setDate(today.getDate() + 30);

    return (
        <DatePicker
            label="Velg dato"
            disableBeforeDate={minus30}
            disableAfterDate={plus30}
            onChange={() => {}}
        />
    );
}`,
            preview: <DatePickerBoundsPreview />,
        },
        {
            title: "Med feilmelding",
            description: "Kontrollert DatePicker som alltid viser en feilmelding.",
            tags: ["error-state"],
            code: `import { useState } from "react";
import { DatePicker } from "@fremtind/jokul/datepicker";

function DatePickerWithError() {
    const [value, setValue] = useState("");

    return (
        <DatePicker
            label="Fødselsdato"
            value={value}
            onChange={(_e, _date, meta) => setValue(meta.value)}
            errorLabel="Ugyldig dato"
        />
    );
}`,
            preview: <DatePickerErrorPreview />,
        },
    ],
};

export default doc;
