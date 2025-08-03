import type { GenericTypes } from "../generic";

export type NumberInputTypes = Omit<GenericTypes, "inputMode" | "datalist"> & {
	inputMode?: "decimal" | "numeric" | "tel";
	datalist?: number[];
};
