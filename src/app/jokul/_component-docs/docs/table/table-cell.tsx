import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "table-cell",
    name: "TableCell",
    package: "@fremtind/jokul/table",
    category: "Visning",
    standalone: false,
    description: "En datacelle i tabellen.",
    preview: null as any,
    props: [
        { name: "align", type: '"left" | "right" | "center"', required: false, source: "custom", status: "stable", default: '"left"', description: "Horisontal tekstjustering." },
        { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Innholdet i cellen." },
    ],
};

export default doc;
