import type { ReactNode } from "react";

export type ElementInfoType = {
	name: string;
	description: string;
	category:
		| "seksjon"
		| "gruppering"
		| "tekst"
		| "lenke"
		| "redigering"
		| "innbygging"
		| "tabulær data"
		| "skjema"
		| "interaksjon";
	spec: string;
	aliases?: string[];
	example?: ReactNode;
};
