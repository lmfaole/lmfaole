import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

export type ButtonTypes = Omit<
	ButtonHTMLAttributes<HTMLButtonElement>,
	"value"
> & {
	value: string | number;
	icon?: ReactNode;
	iconPosition?: "start" | "end";
	danger?: boolean;
};

export type ButtonGroupTypes = HTMLAttributes<HTMLDivElement> & {
	children: ReactNode;
	reverse?: boolean;
	pill?: boolean;
};
