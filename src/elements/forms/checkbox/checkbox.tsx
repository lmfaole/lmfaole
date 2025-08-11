import { mockFlavors } from "../../../data/usage.mock.data.ts";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { CheckboxType } from "./checkbox.type.ts";

import "./checkbox.css";

export const Checkbox = (props: CheckboxType) => {
	const { label, ...rest } = props;

	return (
		<label>
			<input type="checkbox" {...rest} />
			{label}
		</label>
	);
};

export const checkboxInfo: ElementInfoType = {
	name: "Input: Checkbox",
	img: <Checkbox label={mockFlavors[0]} />,
	meta: {
		category: "skjema",
		description:
			"The input element represents a two-state control that represents the element's checkedness state. If the element's checkedness state is true, the control represents a positive selection, and if it is false, a negative selection. If the element's indeterminate IDL attribute is set to true, then the control's selection should be obscured as if the control was in a third, indeterminate, state.\n" +
			"\n",
		spec: "https://html.spec.whatwg.org/multipage/input.html#checkbox-state-(type=checkbox)",
		aka: ["avkrysningsboks"],
	},
};
