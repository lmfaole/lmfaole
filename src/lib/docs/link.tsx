import React from "react";
import { Link } from "@fremtind/jokul/link";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "link",
    name: "Link",
    package: "@fremtind/jokul/link",
    category: "Navigasjon",
    tags: ["navigasjon", "tekst", "interaktiv"],
    description: "Link er Jøkuls grunnleggende lenkestil for inline-lenker og frittstående lenker.",
    notes: "Bruk Link for navigasjon, ikke Button.",
    relatedIds: ["nav-link", "link-list"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, description: "Lenketekst." },
        { name: "href", type: "string", required: true, description: "URL-en lenken peker til." },
        { name: "external", type: "boolean", required: false, default: "false", description: "Åpner i ny fane med ikon." },
    ],
    examples: [
        {
            title: "Inline-lenke",
            description: "Link brukt inline i et avsnitt.",
            code: `<p>
  Les mer om <Link href="/forsikring">våre forsikringstjenester</Link>.
</p>`,
            preview: (
                <p>
                    Les mer om <Link href="/forsikring">våre forsikringstjenester</Link>.
                </p>
            ),
        },
        {
            title: "Frittstående lenke",
            description: "Link som frittstående element.",
            code: `<Flex direction="column" gap="xs">
  <Link href="/om-oss">Om oss</Link>
  <Link href="/kontakt">Kontakt oss</Link>
  <Link href="https://fremtind.no" external>Fremtind.no</Link>
</Flex>`,
            preview: (
                <Flex direction="column" gap="xs">
                    <Link href="/om-oss">Om oss</Link>
                    <Link href="/kontakt">Kontakt oss</Link>
                    <Link href="https://fremtind.no" external>Fremtind.no</Link>
                </Flex>
            ),
        },
    ],
};

export default doc;
