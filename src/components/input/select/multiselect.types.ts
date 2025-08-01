import type { SelectHTMLAttributes } from "react";

export type MultiselectTypes = Omit<
	SelectHTMLAttributes<Omit<HTMLSelectElement, "multiple">>,
	"defaultValue"
> & {
	legend: string;
	items: string[];
	defaultValue?: string[];
};
