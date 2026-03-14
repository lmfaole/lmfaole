import { useState } from "react";
import { FileInput } from "@fremtind/jokul/file-input";
import type { UploadedFile } from "@fremtind/jokul/file-input";
import type { ComponentExample } from "../types";


function FileInputBasicPreview() {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    return (
        <FileInput
            legend="Last opp filer"
            value={files}
            multiple
            accept="image/*,.pdf"
            onChange={(_e, updatedFiles) => setFiles(updatedFiles)}
        />
    );
}

function FileInputImagesPreview() {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    return (
        <FileInput
            legend="Last opp bilde"
            value={files}
            multiple={false}
            accept="image/*"
            onChange={(_e, updatedFiles) => setFiles(updatedFiles)}
        />
    );
}

function FileInputSmallPreview() {
    const [files, setFiles] = useState<UploadedFile[]>([]);

    return (
        <FileInput
            legend="Vedlegg"
            value={files}
            variant="small"
            onChange={(_e, updatedFiles) => setFiles(updatedFiles)}
        />
    );
}


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende filopplasting",
                description: "Støtter bilder og PDF-filer, flere filer om gangen.",
                code: `import { useState } from "react";
    import { FileInput } from "@fremtind/jokul/file-input";

    function FileInputExample() {
        const [files, setFiles] = useState([]);

        return (
            <FileInput
                legend="Last opp filer"
                value={files}
                multiple
                accept="image/*,.pdf"
                onChange={(_e, updatedFiles) => setFiles(updatedFiles)}
            />
        );
    }`,
                preview: <FileInputBasicPreview />,
            },
    {
                title: "Kun bilder",
                description: "Begrens til én bildefil av gangen.",
                code: `import { useState } from "react";
    import { FileInput } from "@fremtind/jokul/file-input";

    function SingleImageInput() {
        const [files, setFiles] = useState([]);

        return (
            <FileInput
                legend="Last opp bilde"
                value={files}
                multiple={false}
                accept="image/*"
                onChange={(_e, updatedFiles) => setFiles(updatedFiles)}
            />
        );
    }`,
                preview: <FileInputImagesPreview />,
            },
    {
                title: "Kompakt variant",
                description: "variant='small' gir en mer kompakt filopplastning.",
                code: `import { useState } from "react";
    import { FileInput } from "@fremtind/jokul/file-input";

    function CompactFileInput() {
        const [files, setFiles] = useState([]);

        return (
            <FileInput
                legend="Vedlegg"
                value={files}
                variant="small"
                onChange={(_e, updatedFiles) => setFiles(updatedFiles)}
            />
        );
    }`,
                preview: <FileInputSmallPreview />,
            }
];
