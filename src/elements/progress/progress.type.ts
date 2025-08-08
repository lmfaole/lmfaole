import type { ProgressHTMLAttributes } from "react";

export type ProgressType = ProgressHTMLAttributes<HTMLProgressElement> & {
	label: string;
};
