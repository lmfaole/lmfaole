import type { InputHTMLAttributes } from "react";

export type CheckboxTypes = InputHTMLAttributes<
	Omit<HTMLInputElement, "type">
> & {
	label: string;
	reverse?: boolean;
	fullWidth?: boolean;
};
