import type { ComponentDoc } from "../types";
import { props } from "./props";
import { LinkListPreview } from "./preview";

const doc: ComponentDoc = {
    id: "link-list",
    name: "Link List",
    package: "@fremtind/jokul/link-list",
    category: "Navigasjon",
    description: "LinkList viser en tematisk gruppert liste av lenker med en felles overskrift.",
    warnings: "Bruk LinkList.Link for lenker inne i komponenten for korrekt styling.",
    relationships: {
        alternatives: [{ id: "link", description: "Bruk Link for en enkelt innebygd hyperkobling i brødtekst fremfor en gruppert navigasjonsliste." }, { id: "nav-link", description: "Bruk NavLink for sidefeltsnavigasjonselementer som fremhever den aktive ruten." }],
    },
    preview: <LinkListPreview />,

    props,
    subComponents: [
        {
            name: "LinkList.Link",
            description: "En lenke inne i lenkegruppelisten.",
            props: [
                { name: "href", type: "string", required: true, source: "native", status: "stable", description: "URL-en lenken peker til." },
                { name: "target", type: "string", required: false, source: "native", status: "stable", description: "Åpner lenken i nytt vindu/fane (f.eks. \"_blank\")." },
                { name: "rel", type: "string", required: false, source: "native", status: "stable", description: "Relasjon mellom gjeldende dokument og lenket dokument (f.eks. \"noopener noreferrer\")." },
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Lenketekst eller innhold." },
            ],
        },
    ],
};

export default doc;
