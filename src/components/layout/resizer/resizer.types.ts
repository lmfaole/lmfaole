import type { AllHTMLAttributes, ReactNode } from "react";

export type ResizerTypes = AllHTMLAttributes<HTMLDivElement> & {
	figcaption: string;
	children: ReactNode;
	padding?: boolean;
	resize?: "both" | "vertical" | "horizontal" | "none";
	restrict?: boolean;
};
