import type { ElementInfoType } from "../../element-info.type.ts";

export const inputRangeInfo: ElementInfoType = {
	name: "InputRange",
	description:
		"The input element represents a control for setting the element's value to a string representing a input-number, but with the caveat that the exact value is not important, letting UAs provide a simpler interface than they do for the InputNumber state.",
	spec: "https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range)",
	category: "skjema",
};
