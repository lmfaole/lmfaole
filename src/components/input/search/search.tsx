import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { GenericInput } from "../generic";
import type { SearchTypes } from "./search.types.ts";

export const SearchInput = (props: SearchTypes) => {
	const {
		label = "Søk",
		placeholder = "Søk",
		required = false,
		name = "q",
		size = 30,
		...rest
	} = props;

	return (
		<GenericInput
			{...rest}
			label={label}
			name={name}
			type="search"
			required={required}
			size={size}
			placeholder={placeholder}
		/>
	);
};

export const searchInputInfo: ComponentInfoTypes = {
	name: "Søkefelt",
	category: "skjema",
	examples: [{ code: <SearchInput label={"Søk"} /> }],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
