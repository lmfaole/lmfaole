import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";

function ListPreview() {
    const isHovered = usePreviewHovered();
    const baseItems = ["Bilforsikring dekker skader", "Reiseforsikring gjelder i Norden"];
    const extraItem = "Innboforsikring inkluderer tyveri";
    return (
        <UnorderedList>
            {baseItems.map(item => <ListItem key={item}>{item}</ListItem>)}
            {isHovered && <ListItem>{extraItem}</ListItem>}
        </UnorderedList>
    );
}

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
