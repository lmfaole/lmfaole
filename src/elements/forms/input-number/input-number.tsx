import { useId } from "react";
import type { InputNumberType } from "./input-number.type.ts";

export const InputNumber = (props: InputNumberType) => {
	const { inputMode = "numeric", label, ...rest } = props;
	const id = useId();

	return (
		<>
			<label htmlFor={label + id}>{label}</label>
			<input id={label + id} type="number" inputMode={inputMode} {...rest} />
		</>
	);
};
