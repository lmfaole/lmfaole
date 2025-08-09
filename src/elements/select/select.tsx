import { useId } from "react";
import { mockFlavors } from "../../components/component.mock.data.ts";
import type { ElementInfoType } from "../element-info.type.ts";
import type { SelectType } from "./select.type.ts";

import "./select.css";

export const Select = (props: SelectType) => {
	const id = useId();

	const { label, ...rest } = props;

	return (
		<div className={"select"}>
			<label htmlFor={`${label}-${id}`}>{label}</label>
			<select id={`${label}-${id}`} {...rest}>
				{props.children}
			</select>
		</div>
	);
};

export const selectInfo: ElementInfoType = {
	name: "Select",
	img: (
		<Select label={"Velg smak"}>
			{mockFlavors.map((flavor) => (
				<option>{flavor}</option>
			))}
		</Select>
	),
};
