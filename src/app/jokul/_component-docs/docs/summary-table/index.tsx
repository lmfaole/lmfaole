import type { ComponentDoc } from "../types";
import { props } from "./props";
import { SummaryTablePreview } from "./preview";

const doc: ComponentDoc = {
    id: "summary-table",
    name: "Summary Table",
    package: "@fremtind/jokul/summary-table",
    category: "Visning",
    description: {
        short: "SummaryTable viser en oppsummering av nøkkel-verdi-par i tabellformat.",
        long: "SummaryTable viser en oppsummering av nøkkel-verdi-par i tabellformat.",
    },
    warnings: "Alltid sett caption — uten det har skjermlesere ingen kontekst for hva tabellen inneholder.",
    relationships: {
        related: [{ id: "description-list", description: "Bruk DescriptionList for nøkkel-verdi-par som ikke krever header- og foterstrukturen til SummaryTable." }, { id: "table", description: "Bruk Table for flerkolonnet tabelldata med sorterbare overskrifter i stedet for et tokolonnet sammendrag." }],
    },
    preview: <SummaryTablePreview />,

    props,
};

export default doc;
