import React from "react";
import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "list",
    name: "List",
    package: "@fremtind/jokul/list",
    category: "Visning",
    tags: ["liste", "tekst"],
    description: "List-komponentene (UnorderedList og OrderedList) brukes for strukturerte lister med konsistent styling.",
    notes: "Bruk UnorderedList for rekkefølge-uavhengige punktlister, OrderedList for nummererte trinn.",
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "ListItem-elementer." },
    ],
    examples: [
        {
            title: "Punktliste",
            description: "UnorderedList for vanlig punktliste.",
            code: `<UnorderedList>
  <ListItem>Bilforsikring</ListItem>
  <ListItem>Hjemforsikring</ListItem>
  <ListItem>Reiseforsikring</ListItem>
</UnorderedList>`,
            preview: (
                <UnorderedList>
                    <ListItem>Bilforsikring</ListItem>
                    <ListItem>Hjemforsikring</ListItem>
                    <ListItem>Reiseforsikring</ListItem>
                </UnorderedList>
            ),
        },
        {
            title: "Nummerert liste",
            description: "OrderedList for steg-for-steg instruksjoner.",
            code: `<OrderedList>
  <ListItem>Logg inn på Min Side</ListItem>
  <ListItem>Velg forsikring</ListItem>
  <ListItem>Fyll inn informasjon</ListItem>
  <ListItem>Bekreft kjøpet</ListItem>
</OrderedList>`,
            preview: (
                <OrderedList>
                    <ListItem>Logg inn på Min Side</ListItem>
                    <ListItem>Velg forsikring</ListItem>
                    <ListItem>Fyll inn informasjon</ListItem>
                    <ListItem>Bekreft kjøpet</ListItem>
                </OrderedList>
            ),
        },
    ],
};

export default doc;
