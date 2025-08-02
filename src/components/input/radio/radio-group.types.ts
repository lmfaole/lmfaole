import type { FieldsetHTMLAttributes } from "react";

export type RadioGroupTypes = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
	legend: string;
	items: string[];
	defaultValue?: string;
	required?: boolean;
};
