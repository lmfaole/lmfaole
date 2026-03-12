import React from "react";
import { LinkList } from "@fremtind/jokul/link-list";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "link-list",
    name: "LinkList",
    package: "@fremtind/jokul/link-list",
    category: "Navigasjon",
    description: "LinkList viser en tematisk gruppert liste av lenker med en felles overskrift.",
    notes: "Bruk LinkList.Link for lenker inne i komponenten for korrekt styling.",
    relatedIds: ["link", "nav-link"],
    props: [
        { name: "label", type: "string", required: true, description: "Overskrift for lenkegruppens seksjon." },
        { name: "hideLabel", type: "boolean", required: false, description: "Skjuler overskriften visuelt." },
        { name: "children", type: "React.ReactNode", required: false, description: "LinkList.Link-elementer." },
    ],
    examples: [
        {
            title: "Navigasjonsliste",
            description: "LinkList med gruppert navigasjon.",
            code: `<LinkList label="Forsikringer">
  <LinkList.Link href="/bilforsikring">Bilforsikring</LinkList.Link>
  <LinkList.Link href="/hjemforsikring">Hjemforsikring</LinkList.Link>
  <LinkList.Link href="/reiseforsikring">Reiseforsikring</LinkList.Link>
</LinkList>`,
            preview: (
                <LinkList label="Forsikringer">
                    <LinkList.Link href="/bilforsikring">Bilforsikring</LinkList.Link>
                    <LinkList.Link href="/hjemforsikring">Hjemforsikring</LinkList.Link>
                    <LinkList.Link href="/reiseforsikring">Reiseforsikring</LinkList.Link>
                </LinkList>
            ),
        },
    ],
};

export default doc;
