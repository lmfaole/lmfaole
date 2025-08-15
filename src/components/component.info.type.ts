import type { ReactNode } from "react";

export type ComponentInfoType = {
	name: string;
	description: string;
	examples?: ReactNode[];
	aliases?: string[];
};
