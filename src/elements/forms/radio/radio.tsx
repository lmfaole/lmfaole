import { useId } from "react";
import { mockFlavors } from "../../../data/usage.mock.data.ts";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { RadioType } from "./radio.type.ts";

export const Radio = (props: RadioType) => {
	const { label, name, ...rest } = props;
	const id = useId();

	return (
		<>
			<input id={`${label}-${id}-radio`} type="radio" {...rest} />
			<label htmlFor={`${label}-${id}-radio`}>{label}</label>
		</>
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
		aka: ["valg"],
	},
};
