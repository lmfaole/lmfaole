import type { BlockquoteHTMLAttributes } from "react";

export type BlockquoteType = Omit<
	BlockquoteHTMLAttributes<HTMLQuoteElement>,
	"cite"
> & {
	cite: {
		href: string;
		label: string;
		author?: string;
	};
};
