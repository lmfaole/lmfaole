import { Link } from "@tanstack/react-router";
import { ListItem, UnorderedList } from "../../elements";

export const GlobalHeader = () => {
	return (
		<header className={"page-width global-header"}>
			<nav aria-label={"hovednavigasjon"}>
				<UnorderedList aria-label={"hovednavigasjon"} layout={"cluster"}>
					<ListItem>
						<Link to="/">Hjem</Link>
					</ListItem>
					<ListItem>
						<Link to="/elementer">Elementer</Link>
					</ListItem>
					<ListItem>
						<Link to="/komponenter">Komponenter</Link>
					</ListItem>
					<ListItem>
						<Link to="/mønster">Mønster</Link>
					</ListItem>
				</UnorderedList>
			</nav>
		</header>
	);
};
