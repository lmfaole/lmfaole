"use client";
import { useState, useEffect } from "react";
import { FileInput } from "@fremtind/jokul/file-input";
import type { UploadedFile } from "@fremtind/jokul/file-input";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function FileInputPreview() {
    const isHovered = usePreviewHovered();
    const [files, setFiles] = useState<UploadedFile[]>([]);
    useEffect(() => { if (!isHovered) setFiles([]); }, [isHovered]);
    return (
        <FileInput
            legend="Last opp dokumenter"
            value={files}
            onChange={(_e, newFiles) => setFiles(newFiles)}
        />
    );
}
