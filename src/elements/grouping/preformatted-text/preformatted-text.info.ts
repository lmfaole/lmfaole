import type { ElementInfoType } from "../../element.info.type.ts";
import { PreformattedTextExample } from "./preformatted-text.example.tsx";

export const preformattedTextInfo: ElementInfoType = {
	name: "Preformatted Text",
	description:
		"The preformatted-input-text element represents a block of preformatted input-text, in which structure is represented by" +
		" typographic conventions rather than by elements.",
	spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-pre-element",
	category: "gruppering",
	aliases: ["code block", "kode", "kodeblokk"],
	examples: [PreformattedTextExample()],
};
