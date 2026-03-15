import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "table-body",
    name: "TableBody",
    package: "@fremtind/jokul/table",
    category: "Visning",
    standalone: false,
    description: "Wrapper for dataradene i tabellen.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableRow-elementer." },
    ],
};

export default doc;
