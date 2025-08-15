import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ClusteredList } from "../../components/clustered-list/clustered-list.tsx";
import {
	Blockquote,
	elements,
	ListItem,
	PreformattedText,
	UnorderedList,
} from "../../elements";
import { patterns } from "../../patterns";

export const Route = createFileRoute("/elementer/$elementName")({
	loader: ({ params: { elementName } }) => {
		const element = elements.find((e) => e.name === elementName);

		if (!element) throw notFound();
		return { element };
	},
	component: RouteComponent,
	errorComponent: ({ error }) => {
		// Render an error message
		return <div>{error.message}</div>;
	},
	notFoundComponent: () => {
		return (
			<main>
				<h1>Fant ikke elementet</h1>
			</main>
		);
	},
});

function RouteComponent() {
	const { element } = Route.useLoaderData();
	const { name, description, spec, example } = element;

	const patternsIncludingElement = patterns.filter(
		(pattern) =>
			pattern.implementedUsingElements &&
			pattern.implementedUsingElements.includes(name),
	);

	return (
		<main>
			<header>
				<h1>{name}</h1>
				<Blockquote
					cite={{
						href: spec,
						label:
							"Web Hypertext Application Technology Working Group (WHATWG)",
					}}
					lang={"en"}
				>
					<p lang={"en"}>{description}</p>
				</Blockquote>
			</header>

			{example && (
				<section>
					<h2>Eksempel</h2>
					{example}
					<h3>Koden</h3>
					<PreformattedText>{example}</PreformattedText>
				</section>
			)}

			{!!patternsIncludingElement.length && (
				<section>
					<h2>
						Mønstre <span lang={"en"}>{name}</span> brukes i
					</h2>
					<UnorderedList aria-label={"Mønstre elementet brukes i"}>
						{patternsIncludingElement.map((pattern) => (
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

			<footer>
				<h2>Elementliste</h2>
				<ClusteredList aria-label={"Elementliste"}>
					{elements
						.filter((e) => e.name !== name)
						.map((element) => (
							<ListItem key={element.name}>
								<Link
									to={"/elementer/$elementName"}
									params={{ elementName: element.name }}
								>
									{element.name}
								</Link>
							</ListItem>
						))}
				</ClusteredList>
			</footer>
		</main>
	);
}
