import type { SelectHTMLAttributes } from "react";

export type SelectTypes = SelectHTMLAttributes<
	Omit<HTMLSelectElement, "multiple">
> & {
	legend: string;
	items: string[];
	defaultValue?: string;
};
