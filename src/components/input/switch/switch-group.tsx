import { GenericGroup } from "../generic/generic-group.tsx";
import type { GenericGroupTypes } from "../generic/generic-group.types.ts";

import "./switch-group.css";

export const SwitchGroup = (props: GenericGroupTypes) => {
	const { children, ...rest } = props;

	return (
		<GenericGroup fullWidth {...rest}>
			{children}
		</GenericGroup>
	);
};
