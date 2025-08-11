import type { ElementInfoType } from "../../element-info.type.ts";
import type { SearchType } from "./search.type.ts";

export const Search = (props: SearchType) => {
	const {
		label = "Søk",
		placeholder = "Søk",
		required = false,
		name = "q",
		...rest
	} = props;

	return (
		<label>
			{label}
			<input
				{...rest}
				name={name}
				type="search"
				required={required}
				placeholder={placeholder}
			/>
		</label>
	);
};

export const searchInputInfo: ElementInfoType = {
	name: "Input: Search",
	img: <Search label={"Søk"} />,
	meta: {
		description:
			"The input element represents a one line plain text edit control for the element's value.",
		spec: "https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)",
		category: "skjema",
		aka: ["søk"],
	},
};
