import type { ReactNode } from "react";
import type { ComponentInfoType } from "../components/component.info.type.ts";
import type { ElementInfoType } from "../elements/element.info.type.ts";

export type PatternInfoType = {
	name: string;
	description: string;
	implementation: ReactNode;
	implementedUsingElements?: ElementInfoType["name"][];
	implementedUsingComponents?: ComponentInfoType["name"][];
	source: {
		href: string;
		label: string;
	};
};
