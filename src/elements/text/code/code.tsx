import type { CodeType } from "./code.type.ts";
import "./code.css";

export const Code = ({ children, ...rest }: CodeType) => {
	return <code {...rest}>{children}</code>;
};
