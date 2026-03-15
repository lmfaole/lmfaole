import type { ComponentDoc } from "../types";
import { navTabsProps } from "./props";

const doc: ComponentDoc = {
    id: "nav-tabs",
    name: "NavTabs",
    package: "@fremtind/jokul/tabs",
    category: "Navigasjon",
    standalone: false,
    description: "Wrapper-komponent som inneholder NavTab-elementene og håndterer tablist-rollen og den animerte indikatoren.",
    preview: null as any,
    props: navTabsProps,
};

export default doc;
