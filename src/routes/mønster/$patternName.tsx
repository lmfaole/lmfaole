import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
	Blockquote,
	ListItem,
	PreformattedText,
	UnorderedList,
} from "../../elements";
import { patterns } from "../../patterns";

export const Route = createFileRoute("/mønster/$patternName")({
	loader: ({ params: { patternName } }) => {
		const pattern = patterns.find((e) => e.name === patternName);

		if (!pattern) throw notFound();
		return { pattern };
	},
	component: RouteComponent,
	errorComponent: ({ error }) => {
		// Render an error message
		return <div>{error.message}</div>;
	},
	notFoundComponent: () => {
		return (
			<main>
				<h1>Fant ikke mønsteret</h1>
			</main>
		);
	},
});

function RouteComponent() {
	const { pattern } = Route.useLoaderData();

	const {
		name,
		description,
		source,
		implementation,
		implementedUsingElements,
		implementedUsingComponents,
	} = pattern;

	return (
		<main>
			<header>
				<h1>{name}</h1>
				<Blockquote
					cite={{ href: source.href, label: source.label }}
					lang={"en"}
				>
					<p className={"h3"} lang={"en"}>
						{description}
					</p>
				</Blockquote>
			</header>

			<section>
				<h2>Eksempel på implementasjon</h2>
				{implementation}
				<h3>Koden</h3>
				<PreformattedText>{implementation}</PreformattedText>
			</section>

			<section>
				<h2>Implementert med</h2>
				<h3>Elementer</h3>
				<UnorderedList
					aria-label={"Elementer i bruk for å implementere mønsteret"}
				>
					{implementedUsingElements &&
						implementedUsingElements.map((element) => (
							<ListItem key={element}>
								<Link
									to={"/elementer/$elementName"}
									params={{ elementName: element }}
								>
									{element}
								</Link>
							</ListItem>
						))}
				</UnorderedList>

				<h3>Komponenter</h3>
				<UnorderedList
					aria-label={"Komponenter i bruk for å implementere mønsteret"}
				>
					{implementedUsingComponents &&
						implementedUsingComponents.map((component) => (
							<ListItem key={component}>
								<Link
									to={"/komponenter/$componentName"}
									params={{ componentName: component }}
								>
									{component}
								</Link>
							</ListItem>
						))}
				</UnorderedList>
			</section>
		</main>
	);
}
