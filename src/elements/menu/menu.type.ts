import type { MenuHTMLAttributes } from "react";

export type MenuType = MenuHTMLAttributes<HTMLMenuElement> & {
	label: string;
	showLabel?: boolean;
};
