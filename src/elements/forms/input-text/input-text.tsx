import { useId } from "react";
import type { InputTextType } from "./input-text.type.ts";

export const InputText = (props: InputTextType) => {
	const { label, ...rest } = props;
	const id = useId();

	return (
		<>
			<label htmlFor={label + id}>{label}</label>
			<input {...rest} id={label + id} type="text" />
		</>
	);
};
