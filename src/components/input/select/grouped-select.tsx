import { useId } from "react";
import type { GroupedSelectTypes } from "./grouped-select.types.ts";

import "./select.css";

export const GroupedSelect = (props: GroupedSelectTypes) => {
	const id = useId();

	const { groups, label, required = true, ...rest } = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<select required={required} name={label} id={id} {...rest}>
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
