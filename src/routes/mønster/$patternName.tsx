import { createFileRoute } from "@tanstack/react-router";
import { patterns } from "../../patterns";

export const Route = createFileRoute("/mønster/$patternName")({
	component: RouteComponent,
});

function RouteComponent() {
	const { patternName } = Route.useParams();

	const pattern = patterns.find((c) => c.name === patternName);

	if (!pattern) return <h1>Du må ha kommet feil</h1>;

	return (
		<main>
			<h1>{pattern.name}</h1>
			{pattern.example}
			<p>
				Hentet fra <a href={pattern.source.href}>{pattern.source.label}</a>
			</p>
		</main>
	);
}
