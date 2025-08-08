import { createFileRoute, Link } from "@tanstack/react-router";
import { components } from "../../components";

export const Route = createFileRoute("/komponenter/")({
	component: ComponentListPage,
});

function ComponentListPage() {
	return (
		<main>
			<h1>Komponenter</h1>
			<ul>
				{components.map((component) => (
					<li>
						<Link
							to={"/komponenter/$componentName"}
							params={{ componentName: component.name }}
						>
							&lt;{component.name} /&gt;
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
