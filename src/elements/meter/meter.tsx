import type { MeterType } from "./meter.type.ts";

import "./meter.css";
import type { ElementInfoType } from "../element-info.type.ts";

export const Meter = (props: MeterType) => {
	const { label, ...rest } = props;

	return (
		<div className={"meter"}>
			<label id={`${label}-meter`} aria-describedby={`${label}-desc`}>
				{label}
			</label>
			<meter aria-labelledby={`${label}-meter`} {...rest} />
			<small id={`${label}-desc`}>
				{props.value} av {props.max}
			</small>
		</div>
	);
};

export const meterInfo: ElementInfoType = {
	name: "Meter",
	example: <Meter value={10} max={100} min={0} label={"Meter"} />,
};
