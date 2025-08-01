import type { MultiselectTypes } from "./multiselect.types.ts";

import "./select.css";

export const Multiselect = (props: MultiselectTypes) => {
	const { legend, items, ...rest } = props;

	return (
		<label>
			{legend}
			<select
				name={legend}
				size={items.length <= 10 ? props.items.length : 10}
				{...rest}
				multiple={true}
			>
				{items.map((item) => (
					<option key={item}>{item}</option>
				))}
			</select>
		</label>
	);
};
