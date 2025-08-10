import type { ReactNode } from "react";

export type PlaygroundType = {
	children: ReactNode;
	requiredProps?: ReactNode[];
	optionalProps?: ReactNode[];
};
