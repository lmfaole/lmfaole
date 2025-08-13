import type { DetailedHTMLProps, HTMLAttributes } from "react";

export type DlType = Omit<
	DetailedHTMLProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement>,
	"aria-label"
> & {
	"aria-label": string;
};
