import React from "react";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "nav-link",
    name: "NavLink",
    package: "@fremtind/jokul/nav-link",
    category: "Navigasjon",
    tags: ["navigasjon", "interaktiv"],
    description: "NavLink er en navigasjonslenke med tydelig aktiv tilstand. Brukes i navigasjonsmeny og sidefelt.",
    notes: "Sett active på gjeldende side for å markere hvilken side brukeren er på.",
    relatedIds: ["link"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "custom", description: "Lenketekst." },
        { name: "href", type: "string", required: false, source: "native", description: "Destinasjon." },
        { name: "active", type: "boolean", required: false, source: "custom", default: "false", description: "Markerer som aktiv gjeldende side." },
        { name: "back", type: "boolean", required: false, source: "custom", default: "false", description: "Viser tilbake-pil." },
    ],
    examples: [
        {
            title: "NavLink",
            description: "Enkel navigasjonslenke.",
            code: `<NavLink href="/forsikringer">Mine forsikringer</NavLink>`,
            preview: <NavLink href="/forsikringer">Mine forsikringer</NavLink>,
            tags: [],
        },
        {
            title: "Navigasjonsmeny",
            description: "NavLink-gruppe der én er markert som aktiv.",
            code: `<Flex direction="column" gap="xs">
  <NavLink href="/hjem" active>Hjem</NavLink>
  <NavLink href="/forsikring">Forsikringer</NavLink>
  <NavLink href="/skade">Skademeldinger</NavLink>
  <NavLink href="/kontakt">Kontakt oss</NavLink>
</Flex>`,
            preview: (
                <Flex direction="column" gap="xs">
                    <NavLink href="/hjem" active>Hjem</NavLink>
                    <NavLink href="/forsikring">Forsikringer</NavLink>
                    <NavLink href="/skade">Skademeldinger</NavLink>
                    <NavLink href="/kontakt">Kontakt oss</NavLink>
                </Flex>
            ),
        },
        {
            title: "Tilbakelenke",
            description: "Bruk back for å vise en lenke som tar brukeren tilbake.",
            code: `<NavLink href="/forsikring" back>Tilbake til forsikringer</NavLink>`,
            preview: <NavLink href="/forsikring" back>Tilbake til forsikringer</NavLink>,
        },
    ],
};

export default doc;
