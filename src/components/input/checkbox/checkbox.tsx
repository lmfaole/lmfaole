import type { CheckboxTypes } from "./checkbox.types.ts";

export const Checkbox = (props: CheckboxTypes) => {
	return (
		<label>
			<input type="checkbox" {...props} />
			{props.label}
		</label>
	);
};
