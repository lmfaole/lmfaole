import type { PatternType } from "../pattern.type.ts";
import type { BreadcrumbType } from "./breadcrumb.type.ts";

import "./breadcrumb.css";

export const Breadcrumb = ({ links }: BreadcrumbType) => {
	const currentPage = links[links.length - 1];

	return (
		<nav aria-label="Brødsmulesti" className="breadcrumb">
			<ol>
				{links.slice(0, links.indexOf(currentPage)).map((link) => (
					<li key={link.label}>
						<a href={link.href}>{link.label}</a>
					</li>
				))}
				<li>
					<a href="#" aria-current="page">
						{currentPage.label}
					</a>
				</li>
			</ol>
		</nav>
	);
};

const links: BreadcrumbType["links"] = [
	{
		href: "/",
		label: "Hjem",
	},
	{
		href: "/mønster",
		label: "Mønster",
	},
	{
		href: "#",
		label: "Brødsmuler",
	},
];

export const breadcrumbInfo: PatternType = {
	name: "Brødsmuler",
	example: <Breadcrumb links={links} />,
	source: {
		href: "https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/examples/breadcrumb/",
		label: "W3C",
	},
};
