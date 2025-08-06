import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<main className={"page-width"}>
			<p>
				Hei, jeg er på{" "}
				<a href={"https://www.linkedin.com/in/olejorgenbakken"}>linkedin</a>.
			</p>
		</main>
	);
}
