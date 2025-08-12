import type { DetailedHTMLProps, TableHTMLAttributes } from "react";

export type TableType = DetailedHTMLProps<
	TableHTMLAttributes<HTMLTableElement>,
	HTMLTableElement
> & {
	caption: string;
};
