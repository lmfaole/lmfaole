import type { InputHTMLAttributes } from "react";

export type NumberTypes = InputHTMLAttributes<
	Omit<HTMLInputElement, "type" | "pattern">
> & {
	label: string;
	datalist?: number[];
	suffix?: string;
};
