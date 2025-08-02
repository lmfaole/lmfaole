import type { TextTypes } from "../text/text.types.ts";

export type CardNumberInputTypes = Omit<TextTypes, "label"> & {
	label?: string;
};
