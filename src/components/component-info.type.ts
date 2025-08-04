import type { ReactNode } from "react";
import type { ComponentExampleTypes } from "./documentation/component-example/component-example.types.ts";

export type ComponentInfoTypes = {
	name: string;
	category: "layout" | "skjema" | "handling" | "dokumentasjon" | "tekst";
	description?: string;
	base: ReactNode;
	examples?: ComponentExampleTypes[];
	docs?: string;
	spec?: string;
	furtherReading?: {
		label: string;
		href: string;
	}[];
};
