import type { ElementInfoType } from "../element-info.type.ts";
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
	name: "Search",
	example: <Search label={"Søk"} />,
};
