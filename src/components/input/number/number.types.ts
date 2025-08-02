import type { InputHTMLAttributes } from "react";

export type NumberTypes = InputHTMLAttributes<
	Omit<HTMLInputElement, "type" | "pattern" | "inputMode">
> & {
	label: string;
	datalist?: number[];
	suffix?: string;
	inputMode?: "decimal" | "numeric" | "tel";
};
