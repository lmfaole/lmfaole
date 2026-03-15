import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "table-row",
    name: "TableRow",
    package: "@fremtind/jokul/table",
    category: "Visning",
    standalone: false,
    description: "En rad i tabellen.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableHeader og TableCell-elementer." },
    ],
};

export default doc;
