import { useState } from "react";
import { DatePicker } from "@fremtind/jokul/datepicker";
import type { ComponentExample } from "../types";

function toDateString(d: Date): string {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
}


function DatePickerBasicPreview() {
    return <DatePicker label="Velg dato" onChange={() => {}} />;
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


export const examples: ComponentExample[] = [
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



    const dd = String(d.getDate()).padStart(2, "0");

    const mm = String(d.getMonth() + 1).padStart(2, "0");

    const yyyy = d.getFullYear();
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
            }
];
