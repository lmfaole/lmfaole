import type { ButtonGroupTypes } from "./button.types.ts";

import "./button.css";

export const ButtonGroup = (props: ButtonGroupTypes) => {
	const { children, reverse, pill = "false", ...rest } = props;

	return (
		<div
			className="button-group"
			data-reverse={reverse}
			data-pill={pill}
			{...rest}
		>
			{children}
		</div>
	);
};
