import { createFileRoute, Link } from "@tanstack/react-router";
import { components } from "../../components";
import { ListItem, UnorderedList } from "../../elements";

export const Route = createFileRoute("/komponenter/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<hgroup>
				<h1>Komponenter</h1>
				<p>Dette er forløpig bare byggeklosser for mønster.</p>
			</hgroup>
			<section>
				<h2>Lista</h2>
				<UnorderedList aria-label={"Lista med mønster"}>
					{components.map((component) => (
						<ListItem key={component.name}>
							<Link
								to={"/komponenter/$componentName"}
								params={{ componentName: component.name }}
							>
								{component.name}
							</Link>
						</ListItem>
					))}
				</UnorderedList>
			</section>
		</main>
	);
}
