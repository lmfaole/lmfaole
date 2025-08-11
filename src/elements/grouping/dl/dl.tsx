import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { ElementInfoType } from "../../element-info.type.ts";
import { DescriptionListPlayground } from "./dl.playground.tsx";

export const DescriptionList = ({
	children,
	...rest
}: DetailedHTMLProps<HTMLAttributes<HTMLDListElement>, HTMLDListElement>) => {
	return <dl {...rest}>{children}</dl>;
};

export const descriptionListInfo: ElementInfoType = {
	name: "Description List",
	img: (
		<DescriptionList>
			<dt>Artister</dt>
			<dd>Zara Larsson</dd>
			<dd>Amok</dd>
			<dt>Album</dt>
			<dd>Words (Single)</dd>
			<dt>Sang</dt>
			<dd>Words</dd>
		</DescriptionList>
	),
	meta: {
		description:
			"The dl element represents an association list consisting of zero or more name-value groups (a description list). A name-value group consists of one or more names (dt elements, possibly as children of a div element child) followed by one or more values (dd elements, possibly as children of a div element child), ignoring any nodes other than dt and dd element children, and dt and dd elements that are children of div element children. Within a single dl element, there should not be more than one dt element for each name.\n" +
			"\n",
		spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element",
		category: "gruppering",
		aka: ["definisjonsliste"],
	},
	playground: DescriptionListPlayground,
};
