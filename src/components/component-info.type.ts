import type { ReactNode } from "react";

export type ComponentExample = {
	code: ReactNode;
	title?: string;
	description?: string | ReactNode;
	restrict?: boolean;
};

export type ComponentInfoTypes = {
	name: string;
	category: "layout" | "skjema" | "handling" | "dokumentasjon" | "tekst";
	description?: string;
	examples?: ComponentExample[];
	docs?: string;
	spec?: string;
	furtherReading?: {
		label: string;
		href: string;
	}[];
};
