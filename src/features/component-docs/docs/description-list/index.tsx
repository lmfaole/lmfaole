import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "description-list",
    name: "Description List",
    package: "@fremtind/jokul/description-list",
    category: "Visning",
    description: "DescriptionList viser nøkkel-verdi-par strukturert som en HTML description list (dl/dt/dd).",
    preview: (
        <DescriptionList>
            <DescriptionTerm>Navn</DescriptionTerm>
            <DescriptionDetail>Ola Nordmann</DescriptionDetail>
            <DescriptionTerm>Adresse</DescriptionTerm>
            <DescriptionDetail>Storgata 1, 0001 Oslo</DescriptionDetail>
            <DescriptionTerm>Forsikringsnummer</DescriptionTerm>
            <DescriptionDetail>NO-1234567</DescriptionDetail>
        </DescriptionList>
    ),

    props,
    subComponents: [
        {
            name: "DescriptionTerm",
            description: "Nøkkelen (dt) i et nøkkel-verdi-par.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold for termen." },
            ],
        },
        {
            name: "DescriptionDetail",
            description: "Verdien (dd) i et nøkkel-verdi-par.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold for detaljen." },
            ],
        },
    ],
    examples,
};

export default doc;
