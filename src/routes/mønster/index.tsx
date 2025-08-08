import { createFileRoute, Link } from "@tanstack/react-router";
import { patterns } from "../../patterns";

export const Route = createFileRoute("/mønster/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1>Mønster</h1>
			<p>
				Her tester jeg å lage mønster definert i{" "}
				<a href={"https://www.w3.org/WAI/ARIA/apg/patterns/"} lang={"en"}>
					ARIA Authoring Practices Guide
				</a>
				.
			</p>
			<ul>
				{patterns.map((pattern) => (
					<li>
						<Link
							to={"/mønster/$patternName"}
							params={{ patternName: pattern.name }}
						>
							{pattern.name}
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
