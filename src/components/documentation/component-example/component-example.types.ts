import type { AllHTMLAttributes, ReactNode } from "react";
import type { ResizerTypes } from "../../layout";

export type ComponentExampleTypes = ResizerTypes &
	AllHTMLAttributes<HTMLDivElement> & {
		children: ReactNode;
		title?: string;
		description?: string | ReactNode;
		columns?: boolean;
	};
