import { NavTab, NavTabs } from "@fremtind/jokul/tabs";
import type { ComponentExample } from "../types";

function NavTabPreview() {
    return (
        <NavTabs aria-label="Seksjon">
            <NavTab href="#" aria-selected>Oversikt</NavTab>
            <NavTab href="#">Detaljer</NavTab>
            <NavTab href="#">Historikk</NavTab>
        </NavTabs>
    );
}

export const examples: ComponentExample[] = [
    {
        title: "Grunnleggende navigasjonsfaner",
        description: "Bruk NavTabs med NavTab for å lage lenkebaserte faner. Sett aria-selected på den aktive fanen basert på gjeldende URL.",
        code: `import { NavTab, NavTabs } from "@fremtind/jokul/tabs";

<NavTabs aria-label="Seksjon">
    <NavTab href="/oversikt" aria-selected={pathname === "/oversikt"}>Oversikt</NavTab>
    <NavTab href="/detaljer" aria-selected={pathname === "/detaljer"}>Detaljer</NavTab>
    <NavTab href="/historikk" aria-selected={pathname === "/historikk"}>Historikk</NavTab>
</NavTabs>`,
        preview: <NavTabPreview />,
    },
    {
        title: "Med Next.js Link",
        description: "Bruk as-propen for å bytte ut a-elementet med Next.js Link for klientnavigasjon uten full sideopplasting.",
        code: `import { NavTab, NavTabs } from "@fremtind/jokul/tabs";
import Link from "next/link";

<NavTabs aria-label="Seksjon">
    <NavTab as={Link} href="/oversikt" aria-selected={pathname === "/oversikt"}>Oversikt</NavTab>
    <NavTab as={Link} href="/detaljer" aria-selected={pathname === "/detaljer"}>Detaljer</NavTab>
</NavTabs>`,
    },
    {
        title: "Som filter med hash-navigasjon",
        description: "NavTabs kan brukes som et filterpanel der hvert valg korresponderer med en ankerlenkeseksjon på siden.",
        code: `import { NavTab, NavTabs } from "@fremtind/jokul/tabs";

<NavTabs aria-label="Filtrer migrering">
    <NavTab href="#" aria-selected={active === null} onClick={() => setActive(null)}>Se alle</NavTab>
    <NavTab href="#migration-iconLeft" aria-selected={active === "iconLeft"} onClick={() => setActive("iconLeft")}>iconLeft</NavTab>
    <NavTab href="#migration-iconRight" aria-selected={active === "iconRight"} onClick={() => setActive("iconRight")}>iconRight</NavTab>
</NavTabs>`,
    },
];
