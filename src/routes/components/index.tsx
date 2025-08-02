import { createFileRoute, Link } from "@tanstack/react-router";
import componentList from "./components.list.ts";

export const Route = createFileRoute("/components/")({
	component: About,
});

function About() {
	return (
		<>
			<h1>Komponenter</h1>
			<ul>
				{componentList.map((component) => (
					<li key={component.name}>
						<h2>
							<Link
								to={`/components/$componentName`}
								params={{ componentName: component.name }}
							>
								{component.name}
							</Link>
						</h2>
						{component.description && <p>{component.description}</p>}
					</li>
				))}
			</ul>
		</>
	);
}
