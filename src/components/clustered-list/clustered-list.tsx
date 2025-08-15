import { UnorderedList } from "../../elements";
import type { UnorderedListType } from "../../elements/grouping/unordered-list/unordered-list.type.ts";
import "./clustered-list.css";

export const ClusteredList = ({ children, ...rest }: UnorderedListType) => {
	return (
		<UnorderedList className={"clustered-list"} {...rest}>
			{children}
		</UnorderedList>
	);
};
