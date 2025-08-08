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
			{element.example}
		</main>
	);
}
