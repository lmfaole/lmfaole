import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "label",
        description: "Følger React-konvensjonen om å sende innhold som children fremfor en prop.",
        deprecates: { name: "label", kind: "prop" },
        replacedBy: [{ name: "children", kind: "prop" }],
        before: `<RadioButton value="basic" label="Basis" />`,
        after: `<RadioButton value="basic">Basis</RadioButton>`,
    },
];
