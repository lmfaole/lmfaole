import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: () => (
		<>
			<header className={"page-width global-header"}>
				<nav aria-label={"hovednavigasjon"}>
					<ul>
						<li>
							<Link to="/" className="[&.active]:font-bold">
								Hjem
							</Link>
						</li>
						<li>
							<Link to="/komponenter" className="[&.active]:font-bold">
								Komponenter
							</Link>
						</li>
						<li>
							<Link to="/mønster" className="[&.active]:font-bold">
								Mønster
							</Link>
						</li>
					</ul>
				</nav>
			</header>
			<div className={"page-width"}>
				{" "}
				<Outlet />
			</div>
			<TanStackRouterDevtools />
		</>
	),
});
