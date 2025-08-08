import type { InputHTMLAttributes } from "react";

export type CheckboxType = InputHTMLAttributes<
	Omit<HTMLInputElement, "type">
> & {
	label: string;
};
