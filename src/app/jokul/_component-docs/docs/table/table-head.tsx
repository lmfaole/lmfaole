import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "table-head",
    name: "TableHead",
    package: "@fremtind/jokul/table",
    category: "Visning",
    standalone: false,
    description: "Wrapper for overskriftsraden i tabellen.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableRow-elementer." },
    ],
};

export default doc;
