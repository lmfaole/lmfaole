import type { GroupedMultiselectTypes } from "./grouped-multiselect.types.ts";

import "./select.css";
import { useId } from "react";

export const GroupedMultiselect = (props: GroupedMultiselectTypes) => {
	const id = useId();

	const { groups, label, required = true, ...rest } = props;

	return (
		<>
			<label htmlFor={id}>{label}</label>
			<select
				required={required}
				name={label}
				size={10}
				{...rest}
				multiple={true}
			>
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
