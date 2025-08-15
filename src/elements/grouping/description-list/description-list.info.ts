import type { ElementInfoType } from "../../element.info.type.ts";

export const descriptionListInfo: ElementInfoType = {
	name: "Description List",
	description:
		"The description-list element represents an association list consisting of zero or more name-value groups (a description list). A name-value group consists of one or more names (dt elements, possibly as children of a div element child) followed by one or more values (dd elements, possibly as children of a div element child), ignoring any nodes other than dt and dd element children, and dt and dd elements that are children of div element children. Within a single description-list element, there should not be more than one dt element for each name.\n" +
		"\n",
	spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element",
	category: "gruppering",
	aliases: ["definisjonsliste"],
};
