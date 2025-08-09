import { createFileRoute } from "@tanstack/react-router";
import { ComponentHero } from "../../components/component-hero/component-hero.tsx";
import { elements } from "../../elements";

export const Route = createFileRoute("/elementer/$elementName")({
	component: RouteComponent,
});

function RouteComponent() {
	const { elementName } = Route.useParams();

	const element = elements.find((e) => e.name === elementName);

	if (!element) return <h1>Du må ha kommet feil</h1>;

	return (
		<main>
			<h1>{element.name}</h1>
			<ComponentHero>{element.img}</ComponentHero>
			<h2>Om elementet</h2>
			{element.meta && (
				<dl>
					<dt>Beskrivelse</dt>
					<dd lang={"en"}>{element.meta.description}</dd>
					<dt>Også kjent som</dt>
					{element.meta.aka.map((aka) => (
						<dd>{aka}</dd>
					))}
					<dt>Spesifikasjon</dt>
					<dd>
						<a href={element.meta.spec}>HTML Standard</a>
					</dd>
				</dl>
			)}
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
		</main>
	);
}
