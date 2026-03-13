import React, { useState } from "react";
import { FileInput } from "@fremtind/jokul/file-input";
import type { UploadedFile } from "@fremtind/jokul/file-input";
import type { ComponentDoc } from "./types";

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

const doc: ComponentDoc = {
    id: "file-input",
    name: "FileInput",
    package: "@fremtind/jokul/file-input",
    category: "Skjema",
    tags: ["filopplasting", "input", "skjema", "dra-og-slipp"],
    status: "stable",
    description:
        "FileInput er et skjemaelement for å laste opp filer. Den støtter dra-og-slipp, filtype- og størrelsesbegrensning, og viser opplastingsstatus.",
    props: [
        {
            name: "legend",
            type: "string",
            required: true,
            source: "custom",
            description: "Synlig legend/label over filopplastningsfeltet.",
        },
        {
            name: "value",
            type: "UploadedFile[]",
            required: true,
            source: "custom",
            description: "Liste over opplastede filer med tilstand og fremdrift.",
        },
        {
            name: "onChange",
            type: "(e: Event, files: UploadedFile[]) => void",
            required: true,
            source: "native",
            description: "Kalles når bruker legger til eller fjerner filer.",
        },
        {
            name: "accept",
            type: "string",
            required: false,
            source: "native",
            description: "Godkjente filtyper, f.eks. 'image/*,.pdf'.",
        },
        {
            name: "maxSizeBytes",
            type: "number",
            required: false,
            source: "custom",
            description: "Maksimal filstørrelse i bytes.",
        },
        {
            name: "multiple",
            type: "boolean",
            required: false,
            source: "native",
            default: "true",
            description: "Tillat opplasting av flere filer samtidig.",
        },
        {
            name: "variant",
            type: '"flexible" | "small"',
            required: false,
            source: "custom",
            description: "Visningsvariant. 'small' gir en kompakt versjon.",
        },
        {
            name: "helpLabel",
            type: "string",
            required: false,
            source: "custom",
            description: "Hjelpetekst under feltet.",
        },
        {
            name: "errorLabel",
            type: "string",
            required: false,
            source: "custom",
            description: "Feilmelding som vises under feltet.",
        },
    ],
    examples: [
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
        },
    ],
};

export default doc;
