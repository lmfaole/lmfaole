import { SummaryTable, SummaryTableRow } from "@fremtind/jokul/summary-table";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function SummaryTablePreview() {
    const isHovered = usePreviewHovered();
    return (
        <SummaryTable
            caption="Oppsummering"
            header={["Dekning", "Pris"]}
            body={
                <>
                    <SummaryTableRow header="Bilforsikring" content="3 200 kr" />
                    <SummaryTableRow header="Reiseforsikring" content="890 kr" />
                </>
            }
            footer={<SummaryTableRow header="Totalt" content={isHovered ? "4 090 kr" : "···"} />}
        />
    );
}

const doc: ComponentDoc = {
    id: "summary-table",
    name: "Summary Table",
    package: "@fremtind/jokul/summary-table",
    category: "Visning",
    description: "SummaryTable viser en oppsummering av nøkkel-verdi-par i tabellformat.",
    warnings: "Alltid sett caption — uten det har skjermlesere ingen kontekst for hva tabellen inneholder.",
    relationships: {
        related: [{ id: "description-list", description: "Bruk DescriptionList for nøkkel-verdi-par som ikke krever header- og foterstrukturen til SummaryTable." }, { id: "table", description: "Bruk Table for flerkolonnet tabelldata med sorterbare overskrifter i stedet for et tokolonnet sammendrag." }],
    },
    preview: <SummaryTablePreview />,

    props,
};

export default doc;
