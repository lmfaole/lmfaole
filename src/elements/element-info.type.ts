import type { ReactNode } from "react";

export type ElementInfoType = {
	name: string;
	img: ReactNode;
	usage?: {
		title: string;
		example: ReactNode;
	}[];
	meta: {
		description: string;
		spec: string;
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
		aka?: string[];
	};
};
