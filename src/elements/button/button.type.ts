import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonType = ButtonHTMLAttributes<HTMLButtonElement> & {
	icon?: ReactNode;
	iconPosition?: "start" | "end";
	danger?: boolean;
};
