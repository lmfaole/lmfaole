import type { DetailedHTMLProps, HTMLAttributes } from "react";

export type DescriptionListType = Omit<
	DetailedHTMLProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement>,
	"aria-label"
> & {
	"aria-label": string;
};
