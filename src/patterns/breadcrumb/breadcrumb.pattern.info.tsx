import { listItemInfo } from "../../elements/grouping/list-item/list-item.info.ts";
import { orderedListInfo } from "../../elements/grouping/ordered-list/ordered-list.info.ts";
import type { PatternInfoType } from "../pattern.info.type.ts";
import { BreadcrumbPattern } from "./breadcrumb.pattern.tsx";

export const breadcrumbInfo: PatternInfoType = {
	name: "Breadcrumb",
	description:
		"A breadcrumb trail consists of a list of links to the parent pages of the current page in hierarchical order. It helps users find their place within a website or web application. Breadcrumbs are often placed horizontally before a page's main content.\n" +
		"\n",
	implementation: <BreadcrumbPattern />,
	implementedUsingElements: [orderedListInfo.name, listItemInfo.name],
	source: {
		href: "https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/examples/breadcrumb/",
		label: "W3C Web Accessibility Initiative (WAI)",
	},
};
