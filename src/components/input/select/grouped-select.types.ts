import type { SelectTypes } from "./select.types.ts";

export type GroupedSelectTypes = SelectTypes & {
	groups: {
		label: string;
		items: string[];
	}[];
};
