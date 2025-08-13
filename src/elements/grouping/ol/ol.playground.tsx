import { type OlHTMLAttributes, useState } from "react";
import { Playground } from "../../../patterns/playground/playground.tsx";
import { Checkbox } from "../../forms/checkbox/checkbox.tsx";
import { Range } from "../../forms/range/range.tsx";
import { Select } from "../../forms/select/select.tsx";
import { ListItem } from "../li/li.tsx";
import { OrderedList } from "./ol.tsx";

export const OrderedListPlayground = () => {
	const types = ["a", "A", "i", "I", "1"];

	const [startValue, setStartValue] = useState(1);
	const [reversed, setReversed] = useState(false);
	const [type, setType] = useState(types[0]);

	return (
		<Playground
			requiredProps={[]}
			optionalProps={[
				<Range
					label={"Start"}
					value={startValue}
					min={-100}
					max={100}
					onChange={(e) => setStartValue(Number(e.target.value))}
				/>,
				<Checkbox
					label={"Reversed"}
					checked={reversed}
					onChange={() => setReversed(!reversed)}
				/>,
				<Select label={"Type"} onChange={(e) => setType(e.target.value)}>
					{types.map((t) => (
						<option>{t}</option>
					))}
				</Select>,
			]}
		>
			<OrderedList
				reversed={reversed}
				type={type as OlHTMLAttributes<HTMLOListElement>["type"]}
				aria-label={"Liste for eksperimentering med sorterte lister"}
			>
				<ListItem value={startValue}>
					Ha mel i en stor bolle. Ha i gjær, sukker og salt. Bland sammen. Spe
					vann i deigen, og rør deigen sammen med en sleiv. Kna den godt sammen
					med hendene, ca. 5 minutter. Du kan også elte den sammen i en
					kjøkkenmaskin. Dekk til og la deigen heve i 20-30 min.
				</ListItem>
				<ListItem>
					Del deigen i emner, og kjevle dem til en tynn leiv. Har du ikke
					kjevle, kan du bruke en vinflaske eller oljeflaske.
				</ListItem>
				<ListItem>
					Pensle lefsene med romtemperert smør og stek dem, en etter en, på
					middels varme i en stekapanne, ca. 2 minutter på hver side. Pensle på
					andre siden før du snur. Hold lefsene varme i et klede.
				</ListItem>
			</OrderedList>
			<footer>
				Hentet fra{" "}
				<a href={"https://www.matprat.no/oppskrifter/kos/myke-pannebrod/"}>
					Matprat oppskriften for myke pannebrød
				</a>
			</footer>
		</Playground>
	);
};
