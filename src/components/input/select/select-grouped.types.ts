import type { SelectTypes } from "./select.types.ts";

export type SelectGroupedTypes = Omit<SelectTypes, "items"> & {
	groups: {
		label: string;
		items: string[];
	}[];
};
