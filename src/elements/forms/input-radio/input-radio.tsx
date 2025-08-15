import { useId } from "react";
import type { InputRadioType } from "./input-radio.type.ts";

export const InputRadio = (props: InputRadioType) => {
	const { label, name, ...rest } = props;
	const id = useId();

	return (
		<>
			<input id={`${label}-${id}-radio`} type="radio" {...rest} />
			<label htmlFor={`${label}-${id}-radio`}>{label}</label>
		</>
	);
};
