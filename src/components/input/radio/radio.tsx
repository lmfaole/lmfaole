import type { RadioTypes } from "./radio.types.ts";

import "./radio.css";

export const Radio = (props: RadioTypes) => {
	return (
		<label>
			<input type="radio" {...props} />
			{props.label}
		</label>
	);
};
