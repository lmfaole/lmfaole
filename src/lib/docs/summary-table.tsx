import React from "react";
import { SummaryTable, SummaryTableRow } from "@fremtind/jokul/summary-table";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "summary-table",
    name: "SummaryTable",
    package: "@fremtind/jokul/summary-table",
    category: "Visning",
    description: "SummaryTable viser en oppsummering av nøkkel-verdi-par i tabellformat.",
    notes: "Alltid sett caption for tilgjengelighet.",
    relatedIds: ["description-list", "table"],
    props: [
        { name: "header", type: "[string, string]", required: true, description: "Tuppel med to kolonneoverskrifter." },
        { name: "body", type: "React.ReactNode", required: true, description: "SummaryTableRow-elementer." },
        { name: "caption", type: "string", required: false, description: "Tilgjengelig tabellbeskrivelse." },
        { name: "footer", type: "React.ReactNode", required: false, description: "Bunntekst i tabellen." },
    ],
    examples: [
        {
            title: "Forsikringsoppsummering",
            description: "Typisk bruk for oppsummering av kjøp.",
            code: `<SummaryTable
    caption="Oppsummering av forsikring"
    header={["Dekning", "Pris per måned"]}
    body={
        <>
            <SummaryTableRow header="Bilforsikring" content="349 kr" />
            <SummaryTableRow header="Tilleggsdekninger" content="89 kr" />
        </>
    }
    footer={<SummaryTableRow header="Totalt" content="438 kr" />}
/>`,
            preview: (
                <SummaryTable
                    caption="Oppsummering av forsikring"
                    header={["Dekning", "Pris per måned"]}
                    body={
                        <>
                            <SummaryTableRow header="Bilforsikring" content="349 kr" />
                            <SummaryTableRow header="Tilleggsdekninger" content="89 kr" />
                        </>
                    }
                    footer={<SummaryTableRow header="Totalt" content="438 kr" />}
                />
            ),
        },
    ],
};

export default doc;
