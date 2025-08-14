import { useId } from "react";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { NumberType } from "./number.type.ts";

export const Number = (props: NumberType) => {
	const { inputMode = "numeric", label, ...rest } = props;
	const id = useId();

	return (
		<>
			<label htmlFor={label + id}>{label}</label>
			<input id={label + id} type="number" inputMode={inputMode} {...rest} />
		</>
	);
};

export const numberInputInfo: ElementInfoType = {
	name: "Number",
	img: <Number label={"Skriv et tall"} />,
	meta: {
		description:
			"The input element represents a control for setting the element's value to a string representing a number.",
		category: "skjema",
		spec: "https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)",
		aka: ["tall-input"],
	},
};
