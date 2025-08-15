import type { InputHTMLAttributes } from "react";

export type InputRadioType = InputHTMLAttributes<
	Omit<HTMLInputElement, "type">
> & {
	label: string;
};
