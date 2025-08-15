import { listItemInfo } from "../../elements/grouping/list-item/list-item.info.ts";
import { orderedListInfo } from "../../elements/grouping/ordered-list/ordered-list.info.ts";
import type { PatternType } from "../pattern.type.ts";
import { links } from "./breadcrumb.data.ts";
import { Breadcrumb } from "./breadcrumb.tsx";

export const breadcrumbInfo: PatternType = {
	name: "Brødsmuler",
	description:
		"A breadcrumb trail consists of a list of links to the parent pages of the current page in hierarchical order. It helps users find their place within a website or web application. Breadcrumbs are often placed horizontally before a page's main content.\n" +
		"\n",
	implementation: <Breadcrumb links={links} />,
	implementedUsingElements: [orderedListInfo.name, listItemInfo.name],
	source: {
		href: "https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/examples/breadcrumb/",
		label: "W3",
	},
};
