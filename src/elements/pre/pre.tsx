import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../button/button.tsx";
import type { ElementInfoType } from "../element-info.type.ts";
import type { PreType } from "./pre.type.ts";

import "./pre.css";

export const Pre = ({ children, language = "html" }: PreType) => {
	const toFormatedText = renderToStaticMarkup(children).replaceAll(
		"><",
		">\n<",
	);

	return (
		<pre data-language={language} className={"pre"}>
			<code>{toFormatedText}</code>
		</pre>
	);
};

export const preInfo: ElementInfoType = {
	name: "Pre",
	example: (
		<Pre>
			<Button>Knapp</Button>
		</Pre>
	),
};
