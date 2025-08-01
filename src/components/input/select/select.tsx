import type { SelectTypes } from "./select.types.ts";

import "./select.css";

export const Select = (props: SelectTypes) => {
	const { items, legend, ...rest } = props;
	return (
		<label>
			{legend}
			<select name={legend} {...rest}>
				{props.items.map((item) => (
					<option key={item}>{item}</option>
				))}
			</select>
		</label>
	);
};
