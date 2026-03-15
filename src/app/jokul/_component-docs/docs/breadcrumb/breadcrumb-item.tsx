import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "breadcrumb-item",
    name: "BreadcrumbItem",
    package: "@fremtind/jokul/breadcrumb",
    category: "Navigasjon",
    standalone: false,
    description: "Et enkelt ledd i brødsmulestien.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Lenke eller tekst for gjeldende side." },
    ],
};

export default doc;
