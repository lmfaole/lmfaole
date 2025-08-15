import type { UnorderedListType } from "./unordered-list.type.ts";

export const UnorderedList = ({ children, ...rest }: UnorderedListType) => {
	return <ul {...rest}>{children}</ul>;
};
