import { renderToStaticMarkup } from "react-dom/server";
import type { ElementInfoType } from "../../element-info.type.ts";
import { Button } from "../../forms/button/button.tsx";
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
	img: (
		<Pre>
			<Button>Knapp</Button>
		</Pre>
	),
	meta: {
		description:
			"The pre element represents a block of preformatted text, in which structure is represented by" +
			" typographic conventions rather than by elements.",
		spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-pre-element",
		category: "gruppering",
		aka: ["code block", "kode", "kodeblokk"],
	},
};
