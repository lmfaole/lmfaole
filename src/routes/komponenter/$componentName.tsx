import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { components } from "../../components";
import { ListItem, UnorderedList } from "../../elements";
import { patterns } from "../../patterns";

export const Route = createFileRoute("/komponenter/$componentName")({
	loader: ({ params: { componentName } }) => {
		const component = components.find((e) => e.name === componentName);

		if (!component) throw notFound();
		return { component };
	},
	component: RouteComponent,
	errorComponent: ({ error }) => {
		return <div>{error.message}</div>;
	},
	notFoundComponent: () => {
		return (
			<main>
				<h1>Fant ikke komponenten</h1>
			</main>
		);
	},
});

function RouteComponent() {
	const { component } = Route.useLoaderData();

	const { name, description, examples } = component;

	const patternsIncludingComponent = patterns.filter(
		(pattern) =>
			pattern.implementedUsingComponents &&
			pattern.implementedUsingComponents.includes(name),
	);

	return (
		<main>
			<header>
				<h1>{name}</h1>

				<p lang={"en"}>{description}</p>
			</header>

			<section>
				<h2>Eksempler</h2>
				{examples}
			</section>

			{!!patternsIncludingComponent.length && (
				<section>
					<h2>
						Mønstre <span lang={"en"}>{name}</span> brukes i
					</h2>
					<UnorderedList aria-label={"Mønstre elementet brukes i"}>
						{patternsIncludingComponent.map((pattern) => (
							<ListItem key={pattern.name}>
								<Link
									to={"/mønster/$patternName"}
									params={{ patternName: pattern.name }}
								>
									{pattern.name}
								</Link>
							</ListItem>
						))}
					</UnorderedList>
				</section>
			)}
		</main>
	);
}
