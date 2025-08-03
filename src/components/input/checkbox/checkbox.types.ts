import type { InputHTMLAttributes } from "react";

export type CheckboxTypes = InputHTMLAttributes<
	Omit<HTMLInputElement, "type">
> & {
	label: string;
	toggle?: boolean;
};
