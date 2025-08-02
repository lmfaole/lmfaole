import { useId } from "react";
import type { MultiselectTypes } from "./multiselect.types.ts";

import "./select.css";

export const Multiselect = (props: MultiselectTypes) => {
	const id = useId();

	const { label, items, required = true, ...rest } = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<select
				id={id}
				name={label}
				size={items.length <= 10 ? props.items.length : 10}
				required={required}
				{...rest}
				multiple={true}
			>
				{items.map((item) => (
					<option key={item}>{item}</option>
				))}
			</select>
		</>
	);
};
