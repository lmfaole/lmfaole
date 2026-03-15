import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "table-of-contents-link",
    name: "TableOfContents.Link",
    package: "@fremtind/jokul/table-of-contents",
    category: "Navigasjon",
    standalone: false,
    description: "En lenke i innholdsfortegnelsen. Rendres som en <a> som standard, men kan byttes med as-prop.",
    preview: null as any,
    props: [
        { name: "href", type: "string", required: true, source: "native", status: "stable", description: "Anker-ID for seksjonen lenken peker til, f.eks. #intro." },
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Lenketeksten." },
        { name: "as", type: "React.ElementType", required: false, source: "custom", status: "stable", description: "Bytt ut underliggende element, f.eks. Next.js Link." },
    ],
};

export default doc;
