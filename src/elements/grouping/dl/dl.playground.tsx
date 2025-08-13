import { Playground } from "../../../patterns/playground/playground.tsx";
import { DescriptionList } from "./dl.tsx";

export const DescriptionListPlayground = () => {
	return (
		<Playground requiredProps={[]} optionalProps={[]}>
			<DescriptionList aria-label={"Eksempelliste: Sanginformasjon"}>
				<dt>Artister</dt>
				<dd>Zara Larsson</dd>
				<dd>Amok</dd>
				<dt>Album</dt>
				<dd>Words (Single)</dd>
				<dt>Sang</dt>
				<dd>Words</dd>
			</DescriptionList>
		</Playground>
	);
};
