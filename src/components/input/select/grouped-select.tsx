import type { GroupedSelectTypes } from "./grouped-select.types.ts";

import "./select.css";

export const GroupedSelect = (props: GroupedSelectTypes) => {
	const { groups, legend, ...rest } = props;
	return (
		<label>
			{legend}
			<select name={props.legend} {...rest}>
				{groups.map((group) => (
					<optgroup key={group.label} label={group.label}>
						{group.items.map((item) => (
							<option key={item}>{item}</option>
						))}
					</optgroup>
				))}
			</select>
		</label>
	);
};
