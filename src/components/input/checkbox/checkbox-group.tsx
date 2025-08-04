import { GenericGroup } from "../generic/generic-group.tsx";
import type { GenericGroupTypes } from "../generic/generic-group.types.ts";

import "./checkbox-group.css";

export const CheckboxGroup = (props: GenericGroupTypes) => {
	const { legend = "Ta noen valg", children, pill = false, ...rest } = props;

	return (
		<GenericGroup legend={legend} data-pill={pill} {...rest}>
			{children}
		</GenericGroup>
	);
};
