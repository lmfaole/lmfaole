import type { MenuType } from "./menu.type.ts";

export const Menu = ({
	label,
	showLabel = false,
	children,
	...rest
}: MenuType) => {
	return (
		<menu aria-label={label} data-show-label={showLabel} {...rest}>
			{children}
		</menu>
	);
};
