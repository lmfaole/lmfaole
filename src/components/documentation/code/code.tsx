import { renderToStaticMarkup } from "react-dom/server";
import { Button } from "../../button";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import type { CodeTypes } from "./code.types.ts";

export const Code = ({ children }: CodeTypes) => {
	const toFormatedText = renderToStaticMarkup(children).replaceAll(
		"><",
		">\n<",
	);

	return (
		<pre>
			<code>{toFormatedText}</code>
		</pre>
	);
};

export const codeExampleInfo: ComponentInfoTypes = {
	name: "Kode",
	category: "dokumentasjon",
	base: (
		<Code>
			<Button>Knapp</Button>
		</Code>
	),
};
