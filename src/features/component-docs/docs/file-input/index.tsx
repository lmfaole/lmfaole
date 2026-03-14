import { useState } from "react";
import { FileInput } from "@fremtind/jokul/file-input";
import type { UploadedFile } from "@fremtind/jokul/file-input";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "file-input",
    name: "File Input",
    package: "@fremtind/jokul/file-input",
    category: "Skjema",
    tags: ["filopplasting", "input", "skjema", "dra-og-slipp"],
    status: "stable",
    description:
        "FileInput er et skjemaelement for å laste opp filer. Den støtter dra-og-slipp, filtype- og størrelsesbegrensning, og viser opplastingsstatus.",
    preview: (
        <div style={{ border: "2px dashed var(--jkl-color-border-default)", borderRadius: "4px", padding: "var(--jkl-spacing-l)", textAlign: "center", color: "var(--jkl-color-text-subdued)" }}>
            <p style={{ margin: "0 0 var(--jkl-spacing-xs)" }}>Slipp filer her, eller</p>
            <button style={{ background: "none", border: "1px solid currentColor", borderRadius: "4px", padding: "6px 16px", cursor: "pointer" }}>Velg filer</button>
        </div>
    ),

    props,
    examples,
};

export default doc;
