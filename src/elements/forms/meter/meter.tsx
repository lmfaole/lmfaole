import { useId } from "react";
import type { ElementInfoType } from "../../element-info.type.ts";
import type { MeterType } from "./meter.type.ts";

import "./meter.css";

export const Meter = (props: MeterType) => {
	const { label, suffix, ...rest } = props;
	const id = useId();

	return (
		<div className={"meter"}>
			<label htmlFor={`${label}-${id}-meter`}>{label}</label>
			<meter id={`${label}-${id}-meter`} title={suffix?.trim()} {...rest}>
				{props.value} av {props.max}
				{suffix}
			</meter>
			<small>
				{props.value} av {props.max}
				{suffix}
			</small>
		</div>
	);
};

export const meterInfo: ElementInfoType = {
	name: "Meter",
	img: <Meter value={10} max={100} label={"Meter"} />,
	meta: {
		description:
			"The meter element represents a scalar measurement within a known range, or a fractional value; for example disk usage, the relevance of a query result, or the fraction of a voting population to have selected a particular candidate.\n" +
			"\n",
		spec: "https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element",
		aka: ["gauge", "måler"],
		category: "skjema",
	},
};
