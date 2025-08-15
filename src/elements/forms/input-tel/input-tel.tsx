import { useId } from "react";
import type { InputTelType } from "./input-tel.type.ts";

export const InputTel = (props: InputTelType) => {
	const {
		label = "Telefon",
		autoComplete = "input-tel-national",
		...rest
	} = props;
	const id = useId();

	return (
		<>
			<label htmlFor={label + id}>{label}</label>
			<input id={label + id} autoComplete={autoComplete} type="tel" {...rest} />
		</>
	);
};
