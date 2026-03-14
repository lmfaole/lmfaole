import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import type { ComponentExample } from "../types";

export const examples: ComponentExample[] = [
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
            }
];
