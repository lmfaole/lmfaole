import type { ReactNode } from "react";

export type ElementInfoType = {
	name: string;
	img: ReactNode;
	usage?: {
		title: string;
		example: ReactNode;
	}[];
	playground?: () => ReactNode;
	meta?: {
		description: string;
		aka: string[];
		spec: string;
	};
};
