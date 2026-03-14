import { NavLink } from "@fremtind/jokul/nav-link";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentExample } from "../types";

export const examples: ComponentExample[] = [
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
            }
];
