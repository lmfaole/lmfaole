import { SummaryTable, SummaryTableRow } from "@fremtind/jokul/summary-table";
import type { ComponentExample } from "../types";

export const examples: ComponentExample[] = [
    {
                title: "Enkel oppsummering",
                description: "Minimal nøkkel-verdi-tabell.",
                code: `<SummaryTable
      caption="Oppsummering"
      header={["Dekning", "Pris"]}
      body={<SummaryTableRow header="Bilforsikring" content="349 kr/mnd" />}
      footer={<SummaryTableRow header="Totalt" content="349 kr/mnd" />}
    />`,
                preview: (
                    <SummaryTable
                        caption="Oppsummering"
                        header={["Dekning", "Pris"]}
                        body={<SummaryTableRow header="Bilforsikring" content="349 kr/mnd" />}
                        footer={<SummaryTableRow header="Totalt" content="349 kr/mnd" />}
                    />
                ),
                tags: [],
            },
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
    {
                title: "Personopplysninger",
                description: "Oppsummering av brukerens personopplysninger før innsending.",
                code: `<SummaryTable
        caption="Dine opplysninger"
        header={["Felt", "Verdi"]}
        body={
            <>
                <SummaryTableRow header="Navn" content="Kari Nordmann" />
                <SummaryTableRow header="Fødselsnummer" content="01019900123" />
                <SummaryTableRow header="Adresse" content="Storgata 1, 0155 Oslo" />
                <SummaryTableRow header="E-post" content="kari@eksempel.no" />
                <SummaryTableRow header="Telefon" content="900 00 000" />
            </>
        }
    />`,
                preview: (
                    <SummaryTable
                        caption="Dine opplysninger"
                        header={["Felt", "Verdi"]}
                        body={
                            <>
                                <SummaryTableRow header="Navn" content="Kari Nordmann" />
                                <SummaryTableRow header="Fødselsnummer" content="01019900123" />
                                <SummaryTableRow header="Adresse" content="Storgata 1, 0155 Oslo" />
                                <SummaryTableRow header="E-post" content="kari@eksempel.no" />
                                <SummaryTableRow header="Telefon" content="900 00 000" />
                            </>
                        }
                    />
                ),
            },
    {
                title: "Skadeoppsummering",
                description: "Oppsummering av en innmeldt skade med totalbeløp.",
                code: `<SummaryTable
        caption="Oppsummering av skademelding"
        header={["Skadepost", "Estimert beløp"]}
        body={
            <>
                <SummaryTableRow header="Frontrute" content="4 500 kr" />
                <SummaryTableRow header="Lykt venstre" content="2 200 kr" />
                <SummaryTableRow header="Panserskade" content="8 700 kr" />
                <SummaryTableRow header="Egenandel" content="– 4 000 kr" />
            </>
        }
        footer={<SummaryTableRow header="Utbetales" content="11 400 kr" />}
    />`,
                preview: (
                    <SummaryTable
                        caption="Oppsummering av skademelding"
                        header={["Skadepost", "Estimert beløp"]}
                        body={
                            <>
                                <SummaryTableRow header="Frontrute" content="4 500 kr" />
                                <SummaryTableRow header="Lykt venstre" content="2 200 kr" />
                                <SummaryTableRow header="Panserskade" content="8 700 kr" />
                                <SummaryTableRow header="Egenandel" content="– 4 000 kr" />
                            </>
                        }
                        footer={<SummaryTableRow header="Utbetales" content="11 400 kr" />}
                    />
                ),
            }
];
