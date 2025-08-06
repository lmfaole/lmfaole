import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { GenericInput } from "../generic";
import type { SearchTypes } from "./search.types.ts";

import "./search.css";

export const SearchInput = (props: SearchTypes) => {
	const {
		label = "Søk",
		placeholder = "Søk",
		required = false,
		name = "q",
		...rest
	} = props;

	return (
		<GenericInput
			{...rest}
			label={label}
			name={name}
			type="search"
			required={required}
			placeholder={placeholder}
		/>
	);
};

export const searchInputInfo: ComponentInfoTypes = {
	name: "Søkefelt",
	category: "skjema",
	base: <SearchInput label={"Søk"} />,
	examples: [
		{
			title: "Ikke aktiv",
			children: <SearchInput label={"Søk"} disabled />,
		},
	],
	spec: "https://html.spec.whatwg.org/#the-input-element",
};
