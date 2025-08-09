import type { ElementInfoType } from "../element-info.type.ts";
import { MeterPlayground } from "./meter.playground.tsx";
import type { MeterType } from "./meter.type.ts";

import "./meter.css";

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
	example: <Meter value={10} max={100} label={"Meter"} />,
	usage: [
		{
			title: "Lav verdi",
			example: <Meter value={15} max={100} min={0} low={20} label={"Lav"} />,
		},
		{
			title: "Høy verdi",
			example: <Meter value={85} max={100} min={0} high={80} label={"Høy"} />,
		},
		{
			title: "Optimal verdi",
			example: (
				<Meter
					value={90}
					max={100}
					min={0}
					high={95}
					low={30}
					optimum={80}
					label={"Optimal"}
				/>
			),
		},
	],
	playground: MeterPlayground,
};
