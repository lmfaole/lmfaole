import { NavTab, NavTabs } from "@fremtind/jokul/tabs";
import type { ComponentDoc } from "../types";
import { props, navTabsProps } from "./props";
import { examples } from "./examples";

function NavTabPreview() {
    return (
        <NavTabs aria-label="Eksempel">
            <NavTab href="#" aria-selected>Aktiv</NavTab>
            <NavTab href="#">Inaktiv</NavTab>
        </NavTabs>
    );
}

const doc: ComponentDoc = {
    id: "nav-tab",
    name: "Nav Tab",
    package: "@fremtind/jokul/tabs",
    category: "Navigasjon",
    description: "NavTab er lenkefaner for URL-basert navigasjon. Aktiv fane styres av aria-selected basert på gjeldende URL — i motsetning til Tabs som er tilstandsstyrt.",
    warnings: "Bruk NavTab for navigasjon mellom sider eller seksjoner. For innholdsveksling innenfor samme side, bruk Tabs.",
    relatedIds: ["tabs", "nav-link", "link"],

    preview: <NavTabPreview />,
    props,
    subComponents: [
        {
            name: "NavTabs",
            description: "Wrapper-komponent som inneholder NavTab-elementene og håndterer tablist-rollen og den animerte indikatoren.",
            props: navTabsProps,
        },
    ],
    examples,
};

export default doc;
