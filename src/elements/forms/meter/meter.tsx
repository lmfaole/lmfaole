import { useId } from "react";
import type { MeterType } from "./meter.type.ts";

export const Meter = (props: MeterType) => {
	const { label, suffix, ...rest } = props;
	const id = useId();

	return (
		<>
			<label htmlFor={`${label}-${id}-meter`}>{label}</label>
			<meter id={`${label}-${id}-meter`} title={suffix?.trim()} {...rest}>
				{props.value} av {props.max}
				{suffix}
			</meter>
		</>
	);
};
