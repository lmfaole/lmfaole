import type { Migration } from "../types";

export const migrations: Migration[] = [
    {
        title: "Migrer fra Select til BETA_Select",
        description: "BETA_Select bruker native <option>-elementer som children i stedet for en items-array, og standard React onChange i stedet for SelectChangeEventHandler.",
        deprecates: [{ name: "items", kind: "prop" }, { name: "SelectChangeEventHandler", kind: "component" }],
        replacedBy: [{ name: "children", kind: "prop" }, { name: "onChange", kind: "prop" }],
        before: `import { Select } from "@fremtind/jokul/select";

<Select
    label="Fylke"
    name="county"
    items={["Oslo", "Viken", "Innlandet", "Agder"]}
    value={value}
    onChange={({ target }) => setValue(target.value)}
/>`,
        after: `import { BETA_Select as Select } from "@fremtind/jokul/select";

<Select
    label="Fylke"
    name="county"
    value={value}
    onChange={(e) => setValue(e.target.value)}
>
    <option value="oslo">Oslo</option>
    <option value="viken">Viken</option>
    <option value="innlandet">Innlandet</option>
    <option value="agder">Agder</option>
</Select>`,
    },
];
