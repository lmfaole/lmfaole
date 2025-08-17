import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<main>
			<hgroup>
				<h1>Ole Jørgen Bakken</h1>
				<p>
					Velkommen til en deltids testside for{" "}
					<Link to="/elementer">elementer</Link>,{" "}
					<Link to="/komponenter">komponenter</Link> og{" "}
					<Link to="/mønster">mønster</Link> jeg bruker i hverdagen min som
					utvikler. Du kan lese <Link to="/om">mer om meg her</Link>.
				</p>
			</hgroup>
		</main>
	);
}
