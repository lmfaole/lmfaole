import type { InputHTMLAttributes } from "react";

export type RangeType = InputHTMLAttributes<Omit<HTMLInputElement, "type">> & {
	label: string;
};
