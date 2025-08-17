import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ClusteredList } from "../components/clustered-list/clustered-list.tsx";
import { ListItem } from "../elements";

export const Route = createRootRoute({
	component: () => (
		<>
			<header className={"global-header"}>
				<nav aria-label={"hovednavigasjon"}>
					<ClusteredList aria-label={"hovednavigasjon"}>
						<ListItem>
							<Link to="/">Hjem</Link>
						</ListItem>
						<ListItem>
							<Link to="/elementer">Elementer</Link>
						</ListItem>
						<ListItem>
							<Link to="/komponenter">Komponenter</Link>
						</ListItem>
						<ListItem>
							<Link to="/mønster">Mønster</Link>
						</ListItem>
					</ClusteredList>
				</nav>
			</header>
			<Outlet />
			<footer className={"global-footer"}>
				<p>Trans-rettigheter er menneskerettigheter</p>
				<p>Fritt Palestina</p>
			</footer>
			<TanStackRouterDevtools />
		</>
	),
	notFoundComponent: () => (
		<main>
			<h1>Fant ikke siden du lette etter</h1>
			<Link to="/">Tilbake til hovedsiden</Link>
		</main>
	),
});
