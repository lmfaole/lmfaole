import type { ReactNode, SelectHTMLAttributes } from "react";

export type SelectType = SelectHTMLAttributes<HTMLSelectElement> & {
	label: string;
	children: ReactNode | ReactNode[];
};
