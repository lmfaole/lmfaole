import type { TagTypes } from "./tag.types.ts";

import "./tag.css";
import type { ComponentInfoType } from "../component-info.type.ts";

export const Tag = ({ children }: TagTypes) => {
	return <small className={"tag"}>{children}</small>;
};

export const tagInfo: ComponentInfoType = {
	name: "Tag",
	category: "tekst",
	example: <Tag>Hei</Tag>,
	builtOn: [<small />],
};
