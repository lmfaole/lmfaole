import type { DetailedHTMLProps, HTMLAttributes } from "react";

export type UnorderedListType = DetailedHTMLProps<
	HTMLAttributes<HTMLUListElement>,
	HTMLUListElement
> & {
	"aria-label": string;
};
