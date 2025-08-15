import type { ElementInfoType } from "../../element.info.type.ts";
import { UnorderedListExample } from "./unordered-list.example.tsx";

export const unorderedListInfo: ElementInfoType = {
	name: "Unordered List",
	description:
		"The unordered-list element represents a list of items, where the order of the items is not important — that is, where changing the order would not materially change the meaning of the document.",
	spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element",
	category: "gruppering",
	aliases: ["usortert liste"],
	examples: [UnorderedListExample()],
};
