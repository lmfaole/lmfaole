import type { FieldsetHTMLAttributes, ReactNode } from "react";

export type GenericGroupTypes = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
	legend: string;
	children: ReactNode;
	fullWidth?: boolean;
	pill?: boolean;
};
