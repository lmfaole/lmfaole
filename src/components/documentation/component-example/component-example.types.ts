import type { AllHTMLAttributes } from "react";
import type { ComponentExample } from "../../component-info.type.ts";
import type { ResizerTypes } from "../../layout";

export type ComponentExampleTypes = AllHTMLAttributes<HTMLDivElement> &
	ComponentExample & {
		showTitle?: boolean;
		columns?: boolean;
		resize?: ResizerTypes["resize"];
	};
