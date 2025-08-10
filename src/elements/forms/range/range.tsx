import { useId } from "react";
import { mockFlavors } from "../../../data/usage.mock.data.ts";
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
	meta: {
		description:
			"The input element represents a control for setting the element's value to a string representing a number, but with the caveat that the exact value is not important, letting UAs provide a simpler interface than they do for the Number state.",
		spec: "https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range)",
		category: "skjema",
	},
};
