import type { DetailedHTMLProps, OlHTMLAttributes } from "react";
import type { ElementInfoType } from "../../element-info.type.ts";
import { OrderedListPlayground } from "./ol.playground.tsx";

export const OrderedList = ({
	children,
	...rest
}: DetailedHTMLProps<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>) => {
	return <ol {...rest}>{children}</ol>;
};

export const orderedListInfo: ElementInfoType = {
	name: "Ordered List",
	img: (
		<OrderedList>
			<li>
				Ha mel i en stor bolle. Ha i gjær, sukker og salt. Bland sammen. Spe
				vann i deigen, og rør deigen sammen med en sleiv. Kna den godt sammen
				med hendene, ca. 5 minutter. Du kan også elte den sammen i en
				kjøkkenmaskin. Dekk til og la deigen heve i 20-30 min.
			</li>
			<li>
				Del deigen i emner, og kjevle dem til en tynn leiv. Har du ikke kjevle,
				kan du bruke en vinflaske eller oljeflaske.
			</li>
			<li>
				Pensle lefsene med romtemperert smør og stek dem, en etter en, på
				middels varme i en stekapanne, ca. 2 minutter på hver side. Pensle på
				andre siden før du snur. Hold lefsene varme i et klede.
			</li>
		</OrderedList>
	),
	meta: {
		description:
			"The ul element represents a list of items, where the order of the items is not important — that is, where changing the order would not materially change the meaning of the document.",
		spec: "https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element",
		category: "gruppering",
		aka: ["sortert liste"],
	},
	playground: OrderedListPlayground,
};
