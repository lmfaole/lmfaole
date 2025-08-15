import type { InputHTMLAttributes } from "react";

export type InputTelType = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
};
