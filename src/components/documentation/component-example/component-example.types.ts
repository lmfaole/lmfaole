import type { AllHTMLAttributes, ReactNode } from "react";
import type { ResizerTypes } from "../../layout";

export type ComponentExampleTypes = AllHTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
	title?: string;
	description?: string | ReactNode;
	restrict?: boolean;
	fullWidth?: boolean;
	showTitle?: boolean;
	columns?: boolean;
	resize?: ResizerTypes["resize"];
};
