import { ListItem } from "../list-item/list-item.tsx";
import { UnorderedList } from "./unordered-list.tsx";

export const UnorderedListExample = () => {
	return (
		<UnorderedList
			aria-label={"Ingredienser for en kake om jeg ikke husker helt feil"}
		>
			<ListItem>560 g hvetemel</ListItem>
			<ListItem>2 ts tørrgjær</ListItem>
			<ListItem>1 ts sukker</ListItem>
			<ListItem>1 ts salt</ListItem>
			<ListItem>3 dl lunkent vann</ListItem>
			<ListItem>50 g romtemperert smør</ListItem>
		</UnorderedList>
	);
};
