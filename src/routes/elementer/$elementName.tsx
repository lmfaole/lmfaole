import { createFileRoute } from "@tanstack/react-router";
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
			<h2>Grunnstil</h2>
			{element.example}
			{element.playground && (
				<>
					<h2 lang="en">Playground</h2>
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
