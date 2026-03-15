"use client";
import { useState } from "react";
import { BETA_Select as Select } from "@fremtind/jokul/select";

export function SelectPreview() {
    const [val, setVal] = useState("");
    return (
        <Select
            label="Velg fylke"
            name="county-beta"
            value={val}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVal(e.target.value)}
        >
            <option value="">Velg</option>
            <option value="oslo">Oslo</option>
            <option value="viken">Viken</option>
        </Select>
    );
}
