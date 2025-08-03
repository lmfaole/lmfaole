import type { GenericTypes } from "../generic";

export type TextTypes = Omit<GenericTypes, "datalist"> & {
	datalist?: string[];
};
