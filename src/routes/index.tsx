import { createFileRoute } from "@tanstack/react-router";
import { ListItem, UnorderedList } from "../elements";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	return (
		<main>
			<header>
				<h1>Ole Jørgen Bakken</h1>
				<p>
					Det er alltid litt kleint å introdusere en personlig nettside syns jeg
					as.
				</p>
			</header>
			<section>
				<h2>Andre steder på internett</h2>
				<UnorderedList aria-label={"Mine lenker"}>
					<ListItem>
						<p>
							<a href={"https://bsky.app/profile/lmfaole.party"} rel={"me"}>
								Bluesky
							</a>
						</p>
					</ListItem>
					<ListItem>
						<p>
							<a href={"https://github.com/lmfaole"} rel={"me"}>
								Github
							</a>
						</p>
					</ListItem>
					<ListItem>
						<p>
							<a
								href={"https://www.linkedin.com/in/olejorgenbakken/"}
								rel={"me"}
							>
								LinkedIn
							</a>
						</p>
					</ListItem>
				</UnorderedList>
			</section>
		</main>
	);
}
