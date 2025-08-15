import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { GlobalFooter, GlobalHeader } from "../components";

export const Route = createRootRoute({
	component: () => (
		<>
			<GlobalHeader />
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
