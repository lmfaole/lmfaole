import { Playground } from "../../../patterns/playground/playground.tsx";
import { ListItem } from "../li/li.tsx";
import { UnorderedList } from "./ul.tsx";

export const UnorderedListPlayground = () => {
	return (
		<Playground requiredProps={[]} optionalProps={[]}>
			<UnorderedList>
				<ListItem>560 g hvetemel</ListItem>
				<ListItem>2 ts tørrgjær</ListItem>
				<ListItem>
					50 g romtemperert smør
					<UnorderedList>
						<ListItem>560 g hvetemel</ListItem>
						<ListItem>
							1 ts salt
							<UnorderedList>
								<ListItem>
									560 g hvetemel
									<UnorderedList>
										<ListItem>560 g hvetemel</ListItem>
									</UnorderedList>
								</ListItem>
								<ListItem>2 ts tørrgjær</ListItem>
								<ListItem>1 ts sukker</ListItem>
							</UnorderedList>
						</ListItem>
						<ListItem>3 dl lunkent vann</ListItem>
					</UnorderedList>
				</ListItem>
				<ListItem>50 g romtemperert smør</ListItem>
			</UnorderedList>
		</Playground>
	);
};
