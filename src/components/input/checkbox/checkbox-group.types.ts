import type { FieldsetHTMLAttributes } from "react";

export type CheckboxGroupTypes = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
	legend: string;
	items: string[];
	defaultValues?: string[];
	required?: boolean;
};
