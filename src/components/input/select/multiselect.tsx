import type { MultiselectTypes } from "./multiselect.types.ts";

import "./select.css";
import { Select } from "./select.tsx";

export const Multiselect = (props: MultiselectTypes) => {
	const { label, items, required = true, ...rest } = props;

	return (
		<Select
			label={label}
			items={items}
			name={label}
			size={items.length <= 10 ? props.items.length : 10}
			required={required}
			multiple={true}
			{...rest}
		/>
	);
};
