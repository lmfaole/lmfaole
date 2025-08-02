import type { SelectHTMLAttributes } from "react";

export type MultiselectTypes = Omit<
	SelectHTMLAttributes<Omit<HTMLSelectElement, "multiple">>,
	"defaultValue"
> & {
	label: string;
	items: string[];
	defaultValue?: string[];
};
