import type { ComponentDoc } from "../types";
import { props } from "./props";
import { ListPreview } from "./preview";

const doc: ComponentDoc = {
    id: "list",
    name: "List",
    package: "@fremtind/jokul/list",
    category: "Visning",
    description: "List-komponentene (UnorderedList og OrderedList) brukes for strukturerte lister med konsistent styling.",
    preview: <ListPreview />,

    props,
};

export default doc;
