import type { ReactNode } from "react";

export type PatternType = {
	name: string;
	example: ReactNode;
	source: {
		href: string;
		label: string;
	};
};
