import type { InputHTMLAttributes } from "react";

export type InputCheckboxType = InputHTMLAttributes<
	Omit<HTMLInputElement, "type">
> & {
	label: string;
};
