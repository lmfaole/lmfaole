import type { InputHTMLAttributes } from "react";

export type TelInputTypes = InputHTMLAttributes<
	Omit<HTMLInputElement, "type" | "inputMode">
> & {
	label?: string;
};
