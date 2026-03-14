import { useState } from "react";
import { DatePicker } from "@fremtind/jokul/datepicker";
import type { ComponentExample } from "../types";

export const migrations: ComponentExample[] = [
    {
                title: "Datovelgeren bruker nå bare onChange",
                description: "extended gjør ikke lenger noe og kan fjernes. For tastetrykk-hendelser, bruk onChange i stedet for onKeyDown.",
                migration: {
                    deprecates: [{ name: "extended", kind: "prop" }, { name: "onKeyDown", kind: "prop" }],
                    replacedBy: [{ name: "onChange", kind: "prop" }],
                    before: `<DatePicker
        label="Velg dato"
        extended
        onKeyDown={(e) => console.log(e)}
        onChange={(_e, date) => setValue(date)}
    />`,


                },
                code: `<DatePicker
        label="Velg dato"
        onChange={(_e, date, meta) => {
            setValue(date);
            // meta.value inneholder råstrengen om du trenger den
        }}
    />`,
            }
];
