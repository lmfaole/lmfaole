"use client";
import { useState, useEffect } from "react";
import { DatePicker } from "@fremtind/jokul/datepicker";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function DatePickerPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("");
    useEffect(() => { if (!isHovered) setValue(""); }, [isHovered]);
    return <DatePicker label="Velg dato" value={value} onChange={(_e, _date, meta) => setValue(meta.value)} />;
}
