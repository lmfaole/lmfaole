import type { SelectHTMLAttributes } from "react";

export type SelectTypes = SelectHTMLAttributes<
	Omit<HTMLSelectElement, "multiple">
> & {
	label: string;
	items: string[];
};
