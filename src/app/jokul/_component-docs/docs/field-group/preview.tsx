"use client";
import { useState } from "react";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Checkbox } from "@fremtind/jokul/checkbox";

export function FieldGroupPreview() {
    const [checked, setChecked] = useState<string[]>([]);
    return (
        <FieldGroup legend="Velg produkt">
            <Checkbox name="fg" value="bil" checked={checked.includes("bil")} onChange={e => setChecked(p => e.target.checked ? [...p, "bil"] : p.filter(x => x !== "bil"))}>Bil</Checkbox>
            <Checkbox name="fg" value="bat" checked={checked.includes("bat")} onChange={e => setChecked(p => e.target.checked ? [...p, "bat"] : p.filter(x => x !== "bat"))}>Båt</Checkbox>
        </FieldGroup>
    );
}
