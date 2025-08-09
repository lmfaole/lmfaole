import { mockFlavors } from "../../../components/component.mock.data.ts";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { RangeType } from "./range.type.ts";

import "./range.css";

export const Range = (props: RangeType) => {
	const { label, ...rest } = props;
	return (
		<div className={"range"}>
			<label>{label}</label>
			<input type="range" {...rest} />
			<small id={`${label}-value`}>{props.value}</small>
		</div>
	);
};

export const radioInfo: ElementInfoType = {
	name: "Radio",
	example: <Range label={mockFlavors[0]} />,
};
