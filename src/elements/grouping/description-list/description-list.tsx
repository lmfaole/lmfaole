import type { DescriptionListType } from "./description-list.type.ts";

export const DescriptionList = ({ children, ...rest }: DescriptionListType) => {
	return <dl {...rest}>{children}</dl>;
};
