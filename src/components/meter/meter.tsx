import type { ComponentInfoTypes } from "../component-info.type.ts";
import type { MeterType } from "./meter.type.ts";

import "./meter.css";

export const Meter = (props: MeterType) => {
	const { label, ...rest } = props;

	return (
		<div className={"meter-wrapper"}>
			<div className={"meter"}>
				<label id={`${label}-meter`} aria-describedby={`${label}-desc`}>
					{label}
				</label>
				<meter aria-labelledby={`${label}-meter`} {...rest} />
				<small id={`${label}-desc`}>
					{props.value} av {props.max}
				</small>
			</div>
		</div>
	);
};

export const meterInfo: ComponentInfoTypes = {
	name: "Meter",
	category: "layout",
	base: <Meter value={10} max={100} min={0} label={"Meter"} />,
	examples: [
		{
			title: "Low",
			children: (
				<Meter
					value={10}
					max={100}
					min={0}
					low={25}
					label={"Konsentrasjonsevne"}
				/>
			),
		},
		{
			title: "High",
			children: (
				<Meter value={100} max={100} min={0} high={85} label={"Treningsevne"} />
			),
		},
		{
			title: "Optimum",
			children: (
				<Meter value={90} max={100} optimum={100} label={"Treningsvilje"} />
			),
		},
	],
};
