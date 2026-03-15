import type { ComponentDoc } from "../types";
import { TableHeadPreview } from "./preview";

const doc: ComponentDoc = {
    id: "table-head",
    name: "TableHead",
    package: "@fremtind/jokul/table",
    category: "Visning",
    standalone: false,
    description: "Wrapper for overskriftsraden i tabellen.",
    preview: <TableHeadPreview />,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableRow-elementer." },
    ],
};

export default doc;
