import type { TagTypes } from "./tag.types.ts";

import "./tag.css";

export const Tag = ({ children }: TagTypes) => {
	return <small className={"tag"}>{children}</small>;
};
