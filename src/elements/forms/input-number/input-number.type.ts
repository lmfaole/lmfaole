import type { InputHTMLAttributes } from "react";

export type InputNumberType = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"inputMode" | "datalist"
> & {
	label: string;
	inputMode?: "decimal" | "numeric" | "tel";
	datalist?: number[];
};
