import { useId } from "react";
import type { InputSearchType } from "./input-search.type.ts";

export const InputSearch = (props: InputSearchType) => {
	const {
		label = "Søk",
		placeholder = "Søk",
		required = false,
		name = "q",
		...rest
	} = props;
	const id = useId();

	return (
		<>
			<label htmlFor={label + id}>{label}</label>
			<input {...rest} id={label + id} type="search" {...rest} />
		</>
	);
};
