import type { SelectHTMLAttributes } from "react";

export type GroupedSelectTypes = SelectHTMLAttributes<
	Omit<HTMLSelectElement, "multiple">
> & {
	legend: string;
	groups: {
		label: string;
		items: string[];
	}[];
	defaultValue?: string;
};
