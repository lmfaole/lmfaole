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
	} = pattern;

	return (
		<main>
			<header>
				<h1>{name}</h1>
				<Blockquote cite={{ href: source.href, label: source.label }}>
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
				<UnorderedList
					aria-label={"Elementer bruk for å implementere mønsteret"}
				>
					{implementedUsingElements.map((element) => (
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
			</section>
		</main>
	);
}
