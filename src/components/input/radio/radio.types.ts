import type { InputHTMLAttributes } from "react";

export type RadioTypes = InputHTMLAttributes<Omit<HTMLInputElement, "type">> & {
	label: string;
};
