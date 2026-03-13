import React from "react";
import { LinkList } from "@fremtind/jokul/link-list";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "link-list",
    name: "LinkList",
    package: "@fremtind/jokul/link-list",
    category: "Navigasjon",
    tags: ["navigasjon", "liste"],
    description: "LinkList viser en tematisk gruppert liste av lenker med en felles overskrift.",
    notes: "Bruk LinkList.Link for lenker inne i komponenten for korrekt styling.",
    relatedIds: ["link", "nav-link"],
    props: [
        { name: "label", type: "string", required: true, description: "Overskrift for lenkegruppens seksjon." },
        { name: "hideLabel", type: "boolean", required: false, default: "false", description: "Skjuler overskriften visuelt." },
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
        {
            title: "Med eksterne lenker",
            description: "LinkList der lenkene åpnes i ny fane.",
            code: `<LinkList label="Nyttige ressurser">
  <LinkList.Link href="https://lovdata.no" target="_blank" rel="noopener noreferrer">
    Lovdata
  </LinkList.Link>
  <LinkList.Link href="https://finanstilsynet.no" target="_blank" rel="noopener noreferrer">
    Finanstilsynet
  </LinkList.Link>
  <LinkList.Link href="https://forbrukerradet.no" target="_blank" rel="noopener noreferrer">
    Forbrukerrådet
  </LinkList.Link>
</LinkList>`,
            preview: (
                <LinkList label="Nyttige ressurser">
                    <LinkList.Link href="https://lovdata.no" target="_blank" rel="noopener noreferrer">Lovdata</LinkList.Link>
                    <LinkList.Link href="https://finanstilsynet.no" target="_blank" rel="noopener noreferrer">Finanstilsynet</LinkList.Link>
                    <LinkList.Link href="https://forbrukerradet.no" target="_blank" rel="noopener noreferrer">Forbrukerrådet</LinkList.Link>
                </LinkList>
            ),
        },
        {
            title: "Uten synlig overskrift",
            description: "LinkList der overskriften er visuelt skjult men tilgjengelig for skjermlesere.",
            code: `<LinkList label="Hurtiglenker" hideLabel>
  <LinkList.Link href="/melde-skade">Meld en skade</LinkList.Link>
  <LinkList.Link href="/endre-avtale">Endre avtale</LinkList.Link>
  <LinkList.Link href="/si-opp">Si opp forsikring</LinkList.Link>
</LinkList>`,
            preview: (
                <LinkList label="Hurtiglenker" hideLabel>
                    <LinkList.Link href="/melde-skade">Meld en skade</LinkList.Link>
                    <LinkList.Link href="/endre-avtale">Endre avtale</LinkList.Link>
                    <LinkList.Link href="/si-opp">Si opp forsikring</LinkList.Link>
                </LinkList>
            ),
        },
    ],
};

export default doc;
