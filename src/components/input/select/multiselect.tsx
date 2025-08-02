import type { MultiselectTypes } from "./multiselect.types.ts";
import { Select } from "./select.tsx";

import "./select.css";

export const Multiselect = (props: MultiselectTypes) => {
	const { items, required = true, ...rest } = props;

	return (
		<Select
			multiple
			items={items}
			size={items.length <= 10 ? items.length : 10}
			required={required}
			{...rest}
		/>
	);
};
