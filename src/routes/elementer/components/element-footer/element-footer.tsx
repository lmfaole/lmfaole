import { Link } from "@tanstack/react-router";
import { elements, ListItem, UnorderedList } from "../../../../elements";
import { Route } from "../../$elementName.tsx";

export const ElementFooter = () => {
	const { element } = Route.useLoaderData();

	return (
		<footer>
			<h2>Elementliste</h2>
			<UnorderedList aria-label={"Elementliste"} layout={"cluster"}>
				{elements
					.filter((e) => e.name !== element.name)
					.map((element) => (
						<ListItem>
							<Link
								to={"/elementer/$elementName"}
								params={{ elementName: element.name }}
							>
								{element.name}
							</Link>
						</ListItem>
					))}
			</UnorderedList>
		</footer>
	);
};
