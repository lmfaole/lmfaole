import { renderToStaticMarkup } from "react-dom/server";
import type { PreformattedTextType } from "./preformatted-text.type.ts";

export const PreformattedText = ({
	children,
	language = "html",
	...rest
}: PreformattedTextType) => {
	const toFormatedText = renderToStaticMarkup(children).replaceAll(
		"><",
		">\n<",
	);

	return (
		<pre data-language={language} {...rest}>
			<code>{toFormatedText}</code>
		</pre>
	);
};
