import type { DetailedHTMLProps, OlHTMLAttributes } from "react";

export type OlType = DetailedHTMLProps<
	OlHTMLAttributes<HTMLOListElement>,
	HTMLOListElement
> & {
	"aria-label": string;
};
