import type { GenericTypes } from "../generic";

export type SearchTypes = Omit<
	GenericTypes,
	"label" | "type" | "datalist" | "suffix"
> & {
	label?: string;
	datalist?: string[];
};
