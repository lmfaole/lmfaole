import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "list",
    name: "List",
    package: "@fremtind/jokul/list",
    category: "Visning",
    description: "List-komponentene (UnorderedList og OrderedList) brukes for strukturerte lister med konsistent styling.",
    preview: (
        <UnorderedList>
            <ListItem>Bilforsikring dekker skader på kjøretøy</ListItem>
            <ListItem>Reiseforsikring gjelder i hele Norden</ListItem>
            <ListItem>Innboforsikring inkluderer tyveri</ListItem>
        </UnorderedList>
    ),

    props,
    examples,
};

export default doc;
