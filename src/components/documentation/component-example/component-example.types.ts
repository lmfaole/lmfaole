import type { AllHTMLAttributes, ReactNode } from "react";

export type ComponentExampleTypes = AllHTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
	title?: string;
	description?: string | ReactNode;
	showMarkup?: boolean;
	interactive?: boolean;
};
