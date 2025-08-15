import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ClusteredList } from "../components/clustered-list/clustered-list.tsx";
import { GlobalFooter } from "../components/global-footer/global-footer.tsx";
import { ListItem } from "../elements";

export const Route = createRootRoute({
	component: () => (
		<>
			<header className={"page-width global-header"}>
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
			<div className={"container"}>
				<Outlet />
				<GlobalFooter />
			</div>
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
