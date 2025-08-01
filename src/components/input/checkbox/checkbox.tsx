import type { CheckboxTypes } from "./checkbox.types.ts";

import "./checkbox.css";

export const Checkbox = (props: CheckboxTypes) => {
	return (
		<label>
			<input type="checkbox" {...props} />
			{props.label}
		</label>
	);
};
