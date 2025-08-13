import type { DetailedHTMLProps, HTMLAttributes } from "react";

export type UlType = DetailedHTMLProps<
	HTMLAttributes<HTMLUListElement>,
	HTMLUListElement
> & {
	"aria-label": string;
};
