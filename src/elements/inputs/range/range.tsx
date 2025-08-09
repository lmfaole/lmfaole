import { useId } from "react";
import { mockFlavors } from "../../../components/component.mock.data.ts";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { RangeType } from "./range.type.ts";

import "./range.css";

export const Range = (props: RangeType) => {
	const { label, ...rest } = props;
	const id = useId();

	return (
		<div className={"range"}>
			<label htmlFor={`${label}-${id}-range`}>{label}</label>
			<input
				id={`${label}-${id}-range`}
				aria-describedby={`${label}-value`}
				type="range"
				{...rest}
			/>
			<small id={`${label}-value`}>{props.value}</small>
		</div>
	);
};

export const radioInfo: ElementInfoType = {
	name: "Radio",
	img: <Range label={mockFlavors[0]} />,
};
