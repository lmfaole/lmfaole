import type { SelectTypes } from "./select.types.ts";

export type GroupedSelectTypes = Omit<SelectTypes, "items"> & {
	groups: {
		label: string;
		items: string[];
	}[];
};
