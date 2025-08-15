import type { ElementInfoType } from "../../element.info.type.ts";

export const listItemInfo: ElementInfoType = {
	name: "List Item",
	description:
		"The list-item element represents a list item. If its parent element is an ordered-list, unordered-list, or menu element, then the element is an item of the parent element's list, as defined for those elements. Otherwise, the list item has no defined list-related relationship to any other list-item element.\n" +
		"\n",
	spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-li-element",
	category: "gruppering",
	aliases: ["listeelement", "punkt"],
};
