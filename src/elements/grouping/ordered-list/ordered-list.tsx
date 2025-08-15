import type { OrderedListType } from "./ordered-list.type.ts";

export const OrderedList = ({ children, ...rest }: OrderedListType) => {
	return <ol {...rest}>{children}</ol>;
};
