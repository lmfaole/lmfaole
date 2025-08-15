import { type ReactNode } from "react";
import type { ElementInfoType } from "../elements/element-info.type.ts";

export type PatternType = {
	name: string;
	description: string;
	implementation: ReactNode;
	implementedUsingElements: ElementInfoType["name"][];
	source: {
		href: string;
		label: string;
	};
};
