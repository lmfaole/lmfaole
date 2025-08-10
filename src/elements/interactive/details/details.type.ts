import type { DetailsHTMLAttributes, ReactNode } from "react";

export type DetailsType = DetailsHTMLAttributes<HTMLDetailsElement> & {
	summary?: string;
	children: ReactNode;
};
