import { useId } from "react";
import { mockFlavors } from "../../components/component.mock.data.ts";
import type { ElementInfoType } from "../element-info.type.ts";
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

export const selectInfo: ElementInfoType = {
	name: "Select",
	example: (
		<Select label={"Velg smak"}>
			{mockFlavors.map((flavor) => (
				<option>{flavor}</option>
			))}
		</Select>
	),
};
