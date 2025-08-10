import { mockFlavors } from "../../../data/usage.mock.data.ts";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { RadioType } from "./radio.type.ts";

import "./radio.css";

export const Radio = (props: RadioType) => {
	const { label, name, ...rest } = props;
	return (
		<label>
			<input type="radio" name={name ? name : label} {...rest} />
			{label}
		</label>
	);
};

export const radioInfo: ElementInfoType = {
	name: "Radio",
	img: <Radio label={mockFlavors[0]} />,
	meta: {
		description:
			"The input element represents a control that, when used in conjunction with other input elements, forms a" +
			" radio button group in which only one control can have its checkedness state set to true. If the element's checkedness state is true, the control represents the selected control in the group, and if it is false, it indicates a control in the group that is not selected.",
		spec: "https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)",
		category: "skjema",
	},
};
