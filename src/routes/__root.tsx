import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { GlobalHeader } from "../components/global-header/global-header.tsx";

export const Route = createRootRoute({
	component: () => (
		<>
			<GlobalHeader />
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
});
