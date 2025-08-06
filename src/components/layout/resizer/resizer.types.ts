import type { AllHTMLAttributes, ReactNode } from "react";

export type ResizerTypes = AllHTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
	caption?: string;
	resize?: "both" | "vertical" | "horizontal" | "none";
	boxed?: boolean;
};
