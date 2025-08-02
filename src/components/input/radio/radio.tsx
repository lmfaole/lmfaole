import type { RadioTypes } from "./radio.types.ts";

export const Radio = (props: RadioTypes) => {
	return (
		<label>
			<input type="radio" {...props} />
			{props.label}
		</label>
	);
};
