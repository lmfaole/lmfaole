import type { DetailsHTMLAttributes, ReactNode } from "react";

export type DetailsTypes = DetailsHTMLAttributes<HTMLDetailsElement> & {
	summary?: string;
	children: ReactNode;
};
