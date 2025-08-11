import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ComponentHero } from "../../components/component-hero/component-hero.tsx";
import { Blockquote, elements, ListItem, UnorderedList } from "../../elements";

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

	return (
		<main>
			<header>
				<h1>
					{element.name}
					{element.meta.aka && (
						<span>
							,{" "}
							<small className={"muted h3"}>
								{element.meta.aka.join(", ")}
							</small>
						</span>
					)}
				</h1>

				<Blockquote
					cite={{ href: element.meta.spec, label: "HTML Standarden" }}
				>
					<p className={"h3"} lang={"en"}>
						{element.meta.description}
					</p>
				</Blockquote>
			</header>

			<ComponentHero>{element.img}</ComponentHero>

			{element.playground && (
				<>
					<h2>Egenskaper</h2>
					{element.playground()}
				</>
			)}
			{element.usage && (
				<>
					<h2>Bruksområder</h2>
					{element.usage.map((use) => (
						<>
							<h3>{use.title}</h3>
							{use.example}
						</>
					))}
				</>
			)}

			<aside>
				<h2>Andre elementer i kategorien {element.meta.category}</h2>
				<UnorderedList>
					{elements
						.filter(
							(e) =>
								element.meta.category === e.meta.category &&
								element.name !== e.name,
						)
						.map((e) => (
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
		</main>
	);
}
