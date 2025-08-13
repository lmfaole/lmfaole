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
			<header>
				<h1>{pattern.name}</h1>
				<p>
					Hentet fra <a href={pattern.source.href}>{pattern.source.label}</a>
				</p>
			</header>
			<section>
				<h2>Eksempel på implementasjon</h2>
				{pattern.example}
			</section>
		</main>
	);
}
