import type { ReactNode } from "react";

export type ElementInfoType = {
	name: string;
	example: ReactNode;
	usage?: {
		title: string;
		example: ReactNode;
	}[];
	playground?: () => ReactNode;
};
