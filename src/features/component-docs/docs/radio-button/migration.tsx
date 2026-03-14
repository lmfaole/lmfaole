import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "Radioknapp-tekst sendes nå som children",
        description: "label-propen på RadioButton er utfaset. Bruk children (tekst som barn av komponenten) i stedet.",
        deprecates: [{ name: "label", kind: "prop" }],
        replacedBy: [{ name: "children", kind: "prop" }],
        before: `<RadioButton value="basic" label="Basis" />`,
        after: `<RadioButton value="basic">Basis</RadioButton>`,
        preview: (
            <RadioButtonGroup legend="Forsikringstype" name="migration-radio">
                <RadioButton value="basic">Basis</RadioButton>
                <RadioButton value="plus">Pluss</RadioButton>
            </RadioButtonGroup>
        ),
    },
];
