import type { ReactNode } from "react";

export type ComponentInfoType = {
	name: string;
	category: "layout" | "skjema" | "handling" | "dokumentasjon" | "tekst";
	example: ReactNode;
	builtOn: ReactNode[];
};
