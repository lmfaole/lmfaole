import { SummaryTable, SummaryTableRow } from "@fremtind/jokul/summary-table";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "summary-table",
    name: "Summary Table",
    package: "@fremtind/jokul/summary-table",
    category: "Visning",
    description: "SummaryTable viser en oppsummering av nøkkel-verdi-par i tabellformat.",
    warnings: "Alltid sett caption — uten det har skjermlesere ingen kontekst for hva tabellen inneholder.",
    relatedIds: ["description-list", "table"],
    preview: (
        <SummaryTable
            caption="Oppsummering"
            header={["Dekning", "Pris"]}
            body={
                <>
                    <SummaryTableRow header="Bilforsikring" content="3 200 kr" />
                    <SummaryTableRow header="Reiseforsikring" content="890 kr" />
                    <SummaryTableRow header="Innboforsikring" content="1 100 kr" />
                </>
            }
            footer={<SummaryTableRow header="Totalt" content="5 190 kr" />}
        />
    ),

    props,
    examples,
};

export default doc;
