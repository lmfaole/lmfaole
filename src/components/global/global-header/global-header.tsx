import { Link } from "@tanstack/react-router";
import { ListItem } from "../../../elements";
import { ClusteredList } from "../../UI/clustered-list/clustered-list.tsx";

export const GlobalHeader = () => {
	return (
		<header className={"page-width global-header"}>
			<nav aria-label={"hovednavigasjon"}>
				<ClusteredList aria-label={"hovednavigasjon"}>
					<ListItem>
						<Link to="/">Hjem</Link>
					</ListItem>
					<ListItem>
						<Link to="/elementer">Elementer</Link>
					</ListItem>
					<ListItem>
						<Link to="/mønster">Mønster</Link>
					</ListItem>
				</ClusteredList>
			</nav>
		</header>
	);
};
