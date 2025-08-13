import { createFileRoute, Link } from "@tanstack/react-router";
import { ListItem, UnorderedList } from "../../elements";
import { patterns } from "../../patterns";

export const Route = createFileRoute("/mønster/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<header>
				<h1>Mønster</h1>
				<p>
					Her tester jeg å lage mønster definert i{" "}
					<a href={"https://www.w3.org/WAI/ARIA/apg/patterns/"} lang={"en"}>
						ARIA Authoring Practices Guide
					</a>
					.
				</p>
			</header>
			<section>
				<h2>Lista</h2>
				<UnorderedList aria-label={"Lista med mønster"}>
					{patterns.map((pattern) => (
						<ListItem>
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
		</main>
	);
}
