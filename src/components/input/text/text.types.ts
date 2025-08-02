import type { InputHTMLAttributes } from "react";

export type TextTypes = InputHTMLAttributes<Omit<HTMLInputElement, "type">> & {
	label: string;
	datalist?: string[];
	suffix?: string;
};
