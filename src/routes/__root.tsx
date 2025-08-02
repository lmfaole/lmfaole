import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: () => (
		<>
			<header>
				<div>
					<Link to="/" className="[&.active]:font-bold">
						Hjem
					</Link>{" "}
					<Link to="/components" className="[&.active]:font-bold">
						Komponenter
					</Link>
				</div>
			</header>
			<main>
				<Outlet />
			</main>
			<TanStackRouterDevtools />
		</>
	),
});
