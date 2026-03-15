import type { ComponentDoc } from "../types";
import { TableBodyPreview } from "./preview";

const doc: ComponentDoc = {
    id: "table-body",
    name: "TableBody",
    package: "@fremtind/jokul/table",
    category: "Visning",
    standalone: false,
    description: "Wrapper for dataradene i tabellen.",
    preview: <TableBodyPreview />,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "TableRow-elementer." },
    ],
};

export default doc;
