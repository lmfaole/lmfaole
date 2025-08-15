import { useId } from "react";
import type { InputCheckboxType } from "./input-checkbox.type.ts";

export const InputCheckbox = (props: InputCheckboxType) => {
	const { label, ...rest } = props;
	const id = useId();

	return (
		<>
			<input id={`${label}-${id}-checkbox`} type="checkbox" {...rest} />
			<label htmlFor={`${label}-${id}-checkbox`}>{label}</label>
		</>
	);
};
