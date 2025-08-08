import type { AllHTMLAttributes, ReactNode } from "react";

export type ComponentExampleType = AllHTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
	title?: string;
	description?: string | ReactNode;
	showMarkup?: boolean;
	interactive?: boolean;
};
