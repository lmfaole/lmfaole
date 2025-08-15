import type { DetailedHTMLProps, LiHTMLAttributes } from "react";

export const ListItem = ({
	children,
	...rest
}: DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>) => {
	return <li {...rest}>{children}</li>;
};
