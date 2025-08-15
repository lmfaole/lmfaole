import type { ElementInfoType } from "../../element.info.type.ts";

export const inputRadioInfo: ElementInfoType = {
	name: "Input type radio",
	description:
		"The input element represents a control that, when used in conjunction with other input elements, forms a" +
		" input-radio button group in which only one control can have its checkedness state set to true. If the element's checkedness state is true, the control represents the selected control in the group, and if it is false, it indicates a control in the group that is not selected.",
	spec: "https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio)",
	category: "skjema",
	aliases: ["valg"],
};
