import type { ComponentInfoTypes } from "../component-info.type.ts";
import type { TagTypes } from "./tag.types.ts";

import "./tag.css";

export const Tag = ({ children }: TagTypes) => {
	return <small className={"tag"}>{children}</small>;
};

export const tagInfo: ComponentInfoTypes = {
	name: "Tag",
	category: "tekst",
	base: <Tag>Hei</Tag>,
};
