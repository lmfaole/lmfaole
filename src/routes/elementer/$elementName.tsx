import { createFileRoute } from "@tanstack/react-router";
import { ComponentHero } from "../../components/component-hero/component-hero.tsx";
import { elements } from "../../elements";
import { Blockquote } from "../../elements/blockquote/blockquote.tsx";

export const Route = createFileRoute("/elementer/$elementName")({
	component: RouteComponent,
});

function RouteComponent() {
	const { elementName } = Route.useParams();

	const element = elements.find((e) => e.name === elementName);

	if (!element) return <h1>Du må ha kommet feil</h1>;

	return (
		<main>
			<header>
				<h1>{element.name}</h1>
				{element.meta && (
					<>
						<small>Også kjent som {element.meta.aka.join(", ")}.</small>
						<Blockquote
							cite={{ href: element.meta.spec, label: "HTML Standarden" }}
						>
							<p className={"h3"} lang={"en"}>
								{element.meta.description}
							</p>
						</Blockquote>
					</>
				)}
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
		</main>
	);
}
