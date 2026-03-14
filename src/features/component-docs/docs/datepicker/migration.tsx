import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "extended er utfaset",
        description: "Propen gjør ikke lenger noe og kan fjernes uten videre.",
        deprecates: { name: "extended", kind: "prop" },
        before: `<DatePicker label="Velg dato" extended onChange={(_e, date) => setValue(date)} />`,
        after: `<DatePicker label="Velg dato" onChange={(_e, date) => setValue(date)} />`,
    },
    {
        title: "onKeyDown er utfaset",
        description: "Bruk onChange i stedet. Det tredje argumentet, meta, inneholder råstrengen fra feltet om du trenger den.",
        deprecates: { name: "onKeyDown", kind: "prop" },
        replacedBy: [{ name: "onChange", kind: "prop" }],
        before: `<DatePicker
    label="Velg dato"
    onKeyDown={(e) => console.log(e.key)}
    onChange={(_e, date) => setValue(date)}
/>`,
        after: `<DatePicker
    label="Velg dato"
    onChange={(_e, date, meta) => {
        setValue(date);
        // meta.value inneholder råstrengen om du trenger den
    }}
/>`,
    },
];
