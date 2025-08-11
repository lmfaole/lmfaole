import type { AllHTMLAttributes } from "react";
import type { ElementInfoType } from "../../element-info.type.ts";
import { ListItem } from "../li/li.tsx";
import { UnorderedListPlayground } from "./ul.playground.tsx";

export const UnorderedList = ({
	children,
	...rest
}: AllHTMLAttributes<HTMLUListElement>) => {
	return (
		<ul className={"ul"} {...rest}>
			{children}
		</ul>
	);
};

export const unorderedListInfo: ElementInfoType = {
	name: "Unordered List",
	img: (
		<UnorderedList>
			<ListItem>560 g hvetemel</ListItem>
			<ListItem>2 ts tørrgjær</ListItem>
			<ListItem>1 ts sukker</ListItem>
			<ListItem>1 ts salt</ListItem>
			<ListItem>3 dl lunkent vann</ListItem>
			<ListItem>50 g romtemperert smør</ListItem>
		</UnorderedList>
	),
	meta: {
		description:
			"The ul element represents a list of items, where the order of the items is not important — that is, where changing the order would not materially change the meaning of the document.",
		spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element",
		category: "gruppering",
		aka: ["usortert list"],
	},
	playground: UnorderedListPlayground,
};
