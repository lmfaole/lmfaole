import type { SelectHTMLAttributes } from "react";

export type GroupedMultiselectTypes = Omit<
	SelectHTMLAttributes<Omit<HTMLSelectElement, "multiple">>,
	"defaultValue"
> & {
	legend: string;
	groups: {
		label: string;
		items: string[];
	}[];
	defaultValue?: string[];
};
