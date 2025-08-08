import type { InputHTMLAttributes } from "react";

export type TextType = InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	datalist?: string[];
};
