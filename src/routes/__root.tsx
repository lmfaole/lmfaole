import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { GlobalFooter } from "../features/global-footer/global-footer.tsx";
import { GlobalHeader } from "../features/global-header/global-header.tsx";

export const Route = createRootRoute({
	component: () => (
		<>
			<GlobalHeader />
			<Outlet />
			<GlobalFooter />
			<TanStackRouterDevtools />
		</>
	),
});
