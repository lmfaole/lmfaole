import { ListItem, OrderedList } from "../../elements";
import type { BreadcrumbType } from "./breadcrumb.type.ts";
import "./breadcrumb.css";

export const Breadcrumb = ({ links }: BreadcrumbType) => {
	const currentPage = links[links.length - 1];

	return (
		<nav aria-label="Brødsmulesti" className="breadcrumb">
			<OrderedList aria-label={"Brødsmuler"}>
				{links.slice(0, links.indexOf(currentPage)).map((link) => (
					<ListItem key={link.label}>
						<a href={link.href}>{link.label}</a>
					</ListItem>
				))}
				<ListItem>
					<a href="#" aria-current="page">
						{currentPage.label}
					</a>
				</ListItem>
			</OrderedList>
		</nav>
	);
};
