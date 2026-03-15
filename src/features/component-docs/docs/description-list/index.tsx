import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function DescriptionListPreview() {
    const isHovered = usePreviewHovered();
    const [highlight, setHighlight] = useState(false);
    useEffect(() => { setHighlight(isHovered); }, [isHovered]);
    return (
        <DescriptionList>
            <DescriptionTerm>Navn</DescriptionTerm>
            <DescriptionDetail><span style={{ fontWeight: highlight ? "bold" : "normal", transition: "font-weight 0.2s" }}>Ola Nordmann</span></DescriptionDetail>
            <DescriptionTerm>Adresse</DescriptionTerm>
            <DescriptionDetail>Storgata 1, 0001 Oslo</DescriptionDetail>
        </DescriptionList>
    );
}

const doc: ComponentDoc = {
    id: "description-list",
    name: "Description List",
    package: "@fremtind/jokul/description-list",
    category: "Visning",
    description: "DescriptionList viser nøkkel-verdi-par strukturert som en HTML description list (dl/dt/dd).",
    preview: <DescriptionListPreview />,

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
};

export default doc;
