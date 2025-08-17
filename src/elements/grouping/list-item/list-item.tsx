import type { DetailedHTMLProps, LiHTMLAttributes } from "react";
import "./list-item.css";

export const ListItem = ({
	children,
	...rest
}: DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>) => {
	return <li {...rest}>{children}</li>;
};
