import type { ComponentDoc } from "../types";
import { NavTabsPreview } from "./preview";
import { navTabsProps } from "./props";

const doc: ComponentDoc = {
    id: "nav-tabs",
    name: "NavTabs",
    package: "@fremtind/jokul/tabs",
    category: "Navigasjon",
    standalone: false,
    description: "Wrapper-komponent som inneholder NavTab-elementene og håndterer tablist-rollen og den animerte indikatoren.",
    preview: <NavTabsPreview />,
    props: navTabsProps,
};

export default doc;
