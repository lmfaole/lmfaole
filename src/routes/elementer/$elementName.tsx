import { createFileRoute, notFound } from "@tanstack/react-router";
import { elements } from "../../elements";
import {
	ElementExample,
	ElementFooter,
	ElementHeader,
	ElementUsage,
} from "./components";

export const Route = createFileRoute("/elementer/$elementName")({
	loader: ({ params: { elementName } }) => {
		const element = elements.find((e) => e.name === elementName);

		if (!element) throw notFound();
		return { element };
	},
	component: RouteComponent,
	errorComponent: ({ error }) => {
		// Render an error message
		return <div>{error.message}</div>;
	},
	notFoundComponent: () => {
		return (
			<main>
				<h1>Fant ikke elementet</h1>
			</main>
		);
	},
});

function RouteComponent() {
	const { element } = Route.useLoaderData();

	return (
		<main>
			<ElementHeader {...element} />
			<ElementExample {...element} />
			<ElementUsage {...element} />
			<ElementFooter />
		</main>
	);
}
