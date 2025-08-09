import type { ElementInfoType } from "../../element-info.type.ts";
import type { NumberType } from "./number.type.ts";

import "./number.css";

export const Number = (props: NumberType) => {
	const { size = 10, inputMode = "numeric", suffix, label, ...rest } = props;

	return (
		<div className={"number-input"}>
			<label>{label}</label>
			<input
				{...rest}
				type="number"
				size={size}
				inputMode={inputMode}
				data-suffix={suffix}
			/>
		</div>
	);
};

export const numberInputInfo: ElementInfoType = {
	name: "Number",
	example: <Number label={"Skriv et tall"} />,
};
