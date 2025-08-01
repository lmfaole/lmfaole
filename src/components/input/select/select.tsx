import { useId } from "react";
import type { SelectTypes } from "./select.types.ts";

import "./select.css";

export const Select = (props: SelectTypes) => {
	const id = useId();

	const { items, label, required = true, ...rest } = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<select id={id} name={label} title={label} required={required} {...rest}>
				{props.items.map((item) => (
					<option key={item}>{item}</option>
				))}
			</select>
		</>
	);
};
