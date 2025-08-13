import { Playground } from "../../../patterns/playground/playground.tsx";
import { ListItem } from "../li/li.tsx";
import { UnorderedList } from "./ul.tsx";

export const UnorderedListPlayground = () => {
	return (
		<Playground requiredProps={[]} optionalProps={[]}>
			<UnorderedList aria-label={"Eksempelliste"}>
				<ListItem>560 g hvetemel</ListItem>
				<ListItem>2 ts tørrgjær</ListItem>
				<ListItem>50 g romtemperert smør</ListItem>
			</UnorderedList>
		</Playground>
	);
};
