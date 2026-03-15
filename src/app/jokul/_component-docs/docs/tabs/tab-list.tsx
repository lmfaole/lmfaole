import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "tab-list",
    name: "TabList",
    package: "@fremtind/jokul/tabs",
    category: "Navigasjon",
    standalone: false,
    description: "Wrapper som inneholder Tab-elementene.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tab-elementer." },
    ],
};

export default doc;
