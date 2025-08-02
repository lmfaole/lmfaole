import type { ReactNode } from "react";

export type ComponentExample = {
	code: ReactNode;
	title?: string;
	description?: string | ReactNode;
};

export type ComponentInfoTypes = {
	name: string;
	category: "layout" | "skjemaelementer" | "handlinger" | "dokumentasjon";
	description?: string;
	examples: ComponentExample[];
	docs?: string;
	spec?: string;
	furtherReading?: {
		label: string;
		href: string;
	}[];
};
