import type { InputHTMLAttributes } from "react";

export type RadioType = InputHTMLAttributes<Omit<HTMLInputElement, "type">> & {
	label: string;
};
