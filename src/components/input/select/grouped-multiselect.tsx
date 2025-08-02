import type { GroupedMultiselectTypes } from "./grouped-multiselect.types.ts";
import { GroupedSelect } from "./grouped-select.tsx";

import "./select.css";

export const GroupedMultiselect = (props: GroupedMultiselectTypes) => {
	const { required = true, ...rest } = props;

	return <GroupedSelect multiple {...rest} />;
};
