import { useState, useEffect } from "react";
import { FileInput } from "@fremtind/jokul/file-input";
import type { UploadedFile } from "@fremtind/jokul/file-input";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function FileInputPreview() {
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

const doc: ComponentDoc = {
    id: "file-input",
    name: "File Input",
    package: "@fremtind/jokul/file-input",
    category: "Skjema",
    status: "stable",
    description:
        "FileInput er et skjemaelement for å laste opp filer. Den støtter dra-og-slipp, filtype- og størrelsesbegrensning, og viser opplastingsstatus.",
    preview: <FileInputPreview />,

    props,
};

export default doc;
