import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { elements, ListItem, UnorderedList } from "../../elements";
import { ElementHeader } from "./components/element-header/element-header.tsx";

export const Route = createFileRoute("/elementer/$elementName")({
	loader: ({ params: { elementName } }) => {
		const element = elements.find((e) => e.name === elementName);

		if (!element) throw notFound();
		return { element };
	},
	component: RouteComponent,
	notFoundComponent: () => {
		return <h1>Fant ikke elementet</h1>;
	},
});

function RouteComponent() {
	const { elementName } = Route.useParams();

	const element = elements.find((e) => e.name === elementName);

	if (!element) return <h1>Ingen komponent med dette navnet</h1>;

	const relatedComponents = elements.filter(
		(e) => element.meta.category === e.meta.category && element.name !== e.name,
	);

	return (
		<main>
			<ElementHeader
				name={element.name}
				img={element.img}
				meta={element.meta}
			/>
			{element.playground && (
				<section>
					<h2>Egenskaper</h2>
					{element.playground()}
				</section>
			)}
			{element.usage && (
				<section>
					<h2>Bruksområder</h2>
					{element.usage.map((use) => (
						<>
							<h3>{use.title}</h3>
							{use.example}
						</>
					))}
				</section>
			)}

			{!!relatedComponents.length && (
				<aside>
					<h2>Andre elementer i kategorien {element.meta.category}</h2>
					<UnorderedList
						aria-label={`Andre elementer i samme kategori (${element.meta.category})`}
					>
						{relatedComponents.map((e) => (
							<ListItem>
								<p>
									<Link
										to={"/elementer/$elementName"}
										params={{ elementName: e.name }}
									>
										{e.name}
									</Link>
								</p>
							</ListItem>
						))}
					</UnorderedList>
				</aside>
			)}
		</main>
	);
}
