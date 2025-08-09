import { createFileRoute } from "@tanstack/react-router";
import { components } from "../../components";
import { ComponentHero } from "../../components/component-hero/component-hero.tsx";

export const Route = createFileRoute("/komponenter/$componentName")({
	component: ComponentPage,
});

function ComponentPage() {
	const { componentName } = Route.useParams();

	const component = components.find(
		(component) => component.name === componentName,
	);

	if (!component) return <h1>Du må ha kommet feil</h1>;

	return (
		<main>
			<h1>{component.name}</h1>
			<ComponentHero>{component.example}</ComponentHero>
		</main>
	);
}
