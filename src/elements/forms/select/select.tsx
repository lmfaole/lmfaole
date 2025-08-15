import { useId } from "react";
import type { SelectType } from "./select.type.ts";

export const Select = (props: SelectType) => {
	const id = useId();

	const { label, ...rest } = props;

	return (
		<>
			<label htmlFor={`${label}-${id}`}>{label}</label>
			<select id={`${label}-${id}`} {...rest}>
				{props.children}
			</select>
		</>
	);
};
