import type { TableType } from "./table.type.ts";
import "./table.css";

export const Table = ({ children, caption, ...rest }: TableType) => {
	return (
		<table {...rest}>
			<caption>{caption}</caption>
			{children}
		</table>
	);
};
