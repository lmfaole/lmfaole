import type { ElementInfoType } from "../../element-info.type.ts";
import { DetailsExample } from "./details.example.tsx";

export const detailsInfo: ElementInfoType = {
	name: "Details",
	description:
		"The details element represents a disclosure widget from which the user can obtain additional" +
		" information or controls.",
	spec: "https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element",
	category: "interaksjon",
	aliases: ["accordion", "trekkspill-liste"],
	example: DetailsExample(),
};
