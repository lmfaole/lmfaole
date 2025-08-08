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
							&lt;{element.name} /&gt;
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
