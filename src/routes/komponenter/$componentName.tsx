import { createFileRoute, notFound } from "@tanstack/react-router";
import { components } from "../../components";

export const Route = createFileRoute("/komponenter/$componentName")({
	loader: ({ params: { componentName } }) => {
		const component = components.find((e) => e.name === componentName);

		if (!component) throw notFound();
		return { component };
	},
	component: RouteComponent,
	errorComponent: ({ error }) => {
		return <div>{error.message}</div>;
	},
	notFoundComponent: () => {
		return (
			<main>
				<h1>Fant ikke komponenten</h1>
			</main>
		);
	},
});

function RouteComponent() {
	const { component } = Route.useLoaderData();

	const { name, description, examples } = component;

	return (
		<main>
			<header>
				<h1>{name}</h1>

				<p className={"h3"} lang={"en"}>
					{description}
				</p>
			</header>

			<section>
				<h2>Eksempler</h2>
				{examples}
			</section>
		</main>
	);
}
