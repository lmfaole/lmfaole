import type { SelectTypes } from "./select.types.ts";

export type MultiselectTypes = Omit<
	SelectTypes,
	"defaultValue" | "multiple"
> & {
	defaultValue?: string[];
};
