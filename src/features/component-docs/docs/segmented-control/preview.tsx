"use client";
import { useState } from "react";
import { SegmentedControl, SegmentedControlButton } from "@fremtind/jokul/segmented-control";

export function SegmentedControlPreview() {
    const [value, setValue] = useState("dag");
    return (
        <SegmentedControl legend="Velg periode" name="period-preview">
            <SegmentedControlButton value="dag" checked={value === "dag"} onChange={() => setValue("dag")}>Dag</SegmentedControlButton>
            <SegmentedControlButton value="uke" checked={value === "uke"} onChange={() => setValue("uke")}>Uke</SegmentedControlButton>
            <SegmentedControlButton value="maned" checked={value === "maned"} onChange={() => setValue("maned")}>Måned</SegmentedControlButton>
        </SegmentedControl>
    );
}
