import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../button/button.tsx";
import type { ElementInfoType } from "../element-info.type.ts";
import type { CodeType } from "./code.type.ts";

import "./code.css";

export const Code = ({ children, language }: CodeType) => {
	const toFormatedText = renderToStaticMarkup(children).replaceAll(
		"><",
		">\n<",
	);

	return (
		<pre data-language={language} className={"code"}>
			<code>{toFormatedText}</code>
		</pre>
	);
};

export const codeInfo: ElementInfoType = {
	name: "Code",
	example: (
		<Code>
			<Button>Knapp</Button>
		</Code>
	),
};
