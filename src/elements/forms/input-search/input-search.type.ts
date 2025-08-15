import type { InputHTMLAttributes } from "react";

export type InputSearchType = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	datalist?: string[];
};
