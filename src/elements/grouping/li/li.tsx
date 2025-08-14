import type { DetailedHTMLProps, LiHTMLAttributes } from "react";
import type { ElementInfoType } from "../../element-info.type.ts";

export const ListItem = ({
	children,
	...rest
}: DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>) => {
	return <li {...rest}>{children}</li>;
};

export const listItemInfo: ElementInfoType = {
	name: "List Item",
	img: <ListItem>560 g hvetemel</ListItem>,
	meta: {
		description:
			"The li element represents a list item. If its parent element is an ol, ul, or menu element, then the element is an item of the parent element's list, as defined for those elements. Otherwise, the list item has no defined list-related relationship to any other li element.\n" +
			"\n",
		spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-li-element",
		category: "gruppering",
		aka: ["listeelement", "punkt"],
	},
};
