import type { InputHTMLAttributes } from "react";

export type SearchType = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	datalist?: string[];
};
