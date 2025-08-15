import type { InputHTMLAttributes } from "react";

export type InputTextType = InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	datalist?: string[];
};
