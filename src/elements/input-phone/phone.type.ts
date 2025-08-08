import type { InputHTMLAttributes } from "react";

export type PhoneType = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
};
