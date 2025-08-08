import type { MeterHTMLAttributes } from "react";

export type MeterType = MeterHTMLAttributes<HTMLMeterElement> & {
	label: string;
	max: number;
	value: number;
};
