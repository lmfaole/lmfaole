import type { ButtonHTMLAttributes } from "react";

export type ButtonTypes = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"value"
> & {
	value: string | number;
};
