import type { DetailedHTMLProps, OlHTMLAttributes } from "react";

export type OrderedListType = DetailedHTMLProps<
	OlHTMLAttributes<HTMLOListElement>,
	HTMLOListElement
> & {
	"aria-label": string;
};
