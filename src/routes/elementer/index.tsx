import { createFileRoute, Link } from "@tanstack/react-router";
import { elements } from "../../elements";

export const Route = createFileRoute("/elementer/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1>Elementer</h1>
			<ul>
				{elements.map((element) => (
					<li>
						<Link
							to={"/elementer/$elementName"}
							params={{ elementName: element.name }}
						>
							{element.name}
						</Link>
						{element.playground && (
							<p className={"muted"}>Har egenskapsoversikt.</p>
						)}
						{element.usage?.length && (
							<p className={"muted"}>
								Har {element.usage.length} eksempler på bruk.
							</p>
						)}
					</li>
				))}
			</ul>
		</main>
	);
}
