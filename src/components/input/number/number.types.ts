import type { InputHTMLAttributes } from "react";

export type NumberInputTypes = InputHTMLAttributes<
	Omit<HTMLInputElement, "type" | "pattern" | "inputMode">
> & {
	label: string;
	datalist?: number[];
	suffix?: string;
	inputMode?: "decimal" | "numeric" | "tel";
};
