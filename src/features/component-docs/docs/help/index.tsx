import { Help } from "@fremtind/jokul/help";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";
import tooltipDoc from "../tooltip";
import popoverDoc from "../popover";
import inputGroupDoc from "../input-group";

const doc: ComponentDoc = {
    id: "help",
    name: "Help",
    package: "@fremtind/jokul/help",
    category: "Overlegg",
    tags: ["hjelp", "popover", "tooltip", "informasjon", "kontekstuell"],
    status: "stable",
    description:
        "Help viser en liten ?-knapp som åpner en flytenede hjelpetekst i et popover. Brukes til å gi kontekstuell hjelp ved skjemafelt uten å ta opp permanent plass i grensesnittet.",
    warnings:
        "Help rendres som en knapp — ikke legg den inne i et annet interaktivt element. Bruk buttonText for en tilgjengelig skjermlesertekst.",
    preview: (
        <Help buttonText="Hjelp om personnummer" position="right">
            Personnummeret ditt er et 11-sifret nummer som identifiserer deg i offentlige registre.
        </Help>
    ),

    relatedIds: [tooltipDoc.id, popoverDoc.id, inputGroupDoc.id],
    props,
    examples,
    migrations,
};

export default doc;
