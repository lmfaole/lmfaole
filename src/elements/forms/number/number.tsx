import type { ElementInfoType } from "../../element-info.type.ts";
import type { NumberType } from "./number.type.ts";

import "./number.css";
import { useId } from "react";

export const Number = (props: NumberType) => {
	const { size = 10, inputMode = "numeric", suffix, label, ...rest } = props;
	const id = useId();

	return (
		<div className={"number-input"}>
			<label htmlFor={label + id}>{label}</label>
			<input
				{...rest}
				id={label + id}
				type="number"
				size={size}
				inputMode={inputMode}
				data-suffix={suffix}
			/>
		</div>
	);
};

export const numberInputInfo: ElementInfoType = {
	name: "Input: Number",
	img: <Number label={"Skriv et tall"} />,
	meta: {
		description:
			"The input element represents a control for setting the element's value to a string representing a number.",
		category: "skjema",
		spec: "https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)",
		aka: ["tall-input"],
	},
};
