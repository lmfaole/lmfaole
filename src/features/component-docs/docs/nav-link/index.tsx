import { NavLink } from "@fremtind/jokul/nav-link";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "nav-link",
    name: "Nav Link",
    package: "@fremtind/jokul/nav-link",
    category: "Navigasjon",
    description: "NavLink er en navigasjonslenke med tydelig aktiv tilstand. Brukes i navigasjonsmeny og sidefelt.",
    relationships: {
        alternatives: [{ id: "link", description: "Bruk Link for innebygde hyperkoblinger i tekstinnhold fremfor sidenavigasjon." }, { id: "link-list", description: "Bruk LinkList når du presenterer en gruppert, merket samling av navigasjonslenker i en kolonne." }],
    },
    preview: (
        <Flex direction="column" gap="xs">
            <NavLink href="#" active>Oversikt</NavLink>
            <NavLink href="#">Mine forsikringer</NavLink>
            <NavLink href="#">Skademeldinger</NavLink>
            <NavLink href="#">Profil</NavLink>
        </Flex>
    ),

    props,
    examples,
};

export default doc;
