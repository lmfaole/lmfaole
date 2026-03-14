import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "label er utfaset",
        description: "Send teksten som children i stedet for label-propen.",
        deprecates: { name: "label", kind: "prop" },
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
