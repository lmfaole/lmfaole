"use client";
import { useState } from "react";
import { Select } from "@fremtind/jokul/select";

export function SelectStablePreview() {
    const [val, setVal] = useState("");
    return (
        <Select
            label="Velg fylke"
            name="county-preview"
            items={["Oslo", "Viken", "Agder"]}
            value={val}
            onChange={({ target }) => setVal(target.value)}
        />
    );
}
