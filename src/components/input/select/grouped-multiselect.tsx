import type { GroupedMultiselectTypes } from "./grouped-multiselect.types.ts";

import "./select.css";

export const GroupedMultiselect = (props: GroupedMultiselectTypes) => {
	const { groups, legend, ...rest } = props;
	return (
		<label>
			{legend}
			<select name={legend} size={10} {...rest} multiple={true}>
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
