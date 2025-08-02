import { useId } from "react";
import type { SelectGroupedTypes } from "./select-grouped.types.ts";

import "./select.css";

export const SelectGrouped = (props: SelectGroupedTypes) => {
	const id = useId();

	const { groups, label, required = true, ...rest } = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<select required={required} name={label} id={id} size={12} {...rest}>
				{groups.map((group) => (
					<optgroup key={group.label} label={group.label}>
						{group.items.map((item) => (
							<option key={item}>{item}</option>
						))}
					</optgroup>
				))}
			</select>
		</>
	);
};
