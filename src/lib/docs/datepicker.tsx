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
            status: "stable",
            default: '"Velg dato"',
            description: "Label som vises over datofelet.",
        },
        {
            name: "onChange",
            type: '(e: ChangeEvent<HTMLInputElement>, date: Date | null, meta: { error: "WRONG_FORMAT" | "OUTSIDE_LOWER_BOUND" | "OUTSIDE_UPPER_BOUND" | null, value: string }) => void',
            required: false,
            source: "react",
            status: "stable",
            description: "Kalles ved endring. Motta dato og evt. feilkode.",
        },
        {
            name: "value",
            type: "string",
            required: false,
            source: "native",
            status: "stable",
            description: "Kontrollert verdi (ISO-datostreng).",
        },
        {
            name: "defaultValue",
            type: "string",
            required: false,
            source: "native",
            status: "stable",
            description: "Ukontrollert startverdi.",
        },
        {
            name: "helpLabel",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            description: "Hjelpetekst under feltet.",
        },
        {
            name: "errorLabel",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            description: "Feilmelding som vises under feltet.",
        },
        {
            name: "disableBeforeDate",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            description: "Deaktiverer datoer før denne datoen i kalenderen (format: 'DD.MM.YYYY').",
        },
        {
            name: "disableAfterDate",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            description: "Deaktiverer datoer etter denne datoen i kalenderen (format: 'DD.MM.YYYY').",
        },
        {
            name: "showCalendarLabel",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            description: "Tilgjengelig label for å åpne kalenderen.",
        },
        {
            name: "hideCalendarLabel",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            description: "Tilgjengelig label for å lukke kalenderen.",
        },
        {
            name: "extended",
            type: "boolean",
            required: false,
            source: "custom",
            status: "deprecated",
            statusDescription: "Kalenderen viser nå alltid navigasjonskontroller. Denne propen gjør ikke lenger noe og kan fjernes.",
            description: "Viste utvidede navigasjonskontroller i kalenderen.",
        },
        {
            name: "onKeyDown",
            type: "DatePickerKeyDownEventHandler",
            required: false,
            source: "react",
            status: "deprecated",
            statusDescription: "Har mye overlapp med onChange. Foretrekk onChange for ny kode.",
            description: "Kalles ved tastetrykk i inputfeltet.",
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
        {
            title: "Migrering: extended / onKeyDown",
            description: "extended gjør ikke lenger noe og kan fjernes. For tastetrykk-hendelser, bruk onChange i stedet for onKeyDown.",
            migrationBefore: `<DatePicker
    label="Velg dato"
    extended
    onKeyDown={(e) => console.log(e)}
    onChange={(_e, date) => setValue(date)}
/>`,
            code: `<DatePicker
    label="Velg dato"
    onChange={(_e, date, meta) => {
        setValue(date);
        // meta.value inneholder råstrengen om du trenger den
    }}
/>`,
        },
    ],
};

export default doc;
