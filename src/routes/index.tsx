import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<main>
			<h1>Ehhh denne siden er fortsatt litt skrall</h1>
			<p>Sjekk en underside for litt mer innhold</p>
			<p>
				Jeg er forøvrig på{" "}
				<a href={"https://www.linkedin.com/in/olejorgenbakken"}>linkedin</a>{" "}
				også.
			</p>
		</main>
	);
}
