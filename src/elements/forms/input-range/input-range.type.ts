import type { InputHTMLAttributes } from "react";

export type InputRangeType = InputHTMLAttributes<
	Omit<HTMLInputElement, "type">
> & {
	label: string;
};
