import type { NumberInputTypes } from "../number";

export type TelInputTypes = Omit<
	NumberInputTypes,
	"type" | "inputMode" | "label"
> & {
	label?: string;
};
