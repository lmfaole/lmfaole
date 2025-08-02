import type { ReactNode } from "react";

export type ComponentInfo = {
	name: string;
	example?: ReactNode;
	description?: string;
	docs?: string;
	spec?: string;
};
