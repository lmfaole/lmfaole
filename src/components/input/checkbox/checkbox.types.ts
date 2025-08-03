import type { InputHTMLAttributes } from "react";

export type CheckboxTypes = InputHTMLAttributes<
	Omit<HTMLInputElement, "type">
> & {
	label: string;
	reverse?: boolean;
	toggle?: boolean;
	fullWidth?: boolean;
};
