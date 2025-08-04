import type { GenericGroupTypes } from "./generic-group.types.ts";

import "./generic-group.css";

export const GenericGroup = (props: GenericGroupTypes) => {
	const { children, fullWidth, ...rest } = props;

	return (
		<fieldset data-full-width={fullWidth} {...rest}>
			<legend>{props.legend}</legend>
			{children}
		</fieldset>
	);
};
