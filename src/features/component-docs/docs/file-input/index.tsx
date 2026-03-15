import type { ComponentDoc } from "../types";
import { props } from "./props";
import { FileInputPreview } from "./preview";

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
