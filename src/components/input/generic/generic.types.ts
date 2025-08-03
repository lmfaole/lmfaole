import type { InputHTMLAttributes } from "react";

export type GenericTypes = InputHTMLAttributes<
	Omit<HTMLInputElement, "type">
> & {
	label: string;
	datalist?: string[] | number[];
	suffix?: string;
};
