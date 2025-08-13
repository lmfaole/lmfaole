import { Link } from "@tanstack/react-router";
import { elements, ListItem, UnorderedList } from "../../elements";
import { patterns } from "../../patterns";

export const GlobalHeader = () => {
	return (
		<header className={"page-width global-header"}>
			<nav aria-label={"hovednavigasjon"}>
				<UnorderedList aria-label={"hovednavigasjon"}>
					<ListItem>
						<Link to="/">Hjem</Link>
					</ListItem>
					<ListItem>
						<Link to="/elementer">Elementer</Link>
						<UnorderedList aria-label={"elementer"}>
							{elements.map((element) => (
								<ListItem>
									<Link
										to="/elementer/$elementName"
										params={{ elementName: element.name }}
									>
										{element.name}
									</Link>
								</ListItem>
							))}
						</UnorderedList>
					</ListItem>
					<ListItem>
						<Link to="/komponenter">Komponenter</Link>
					</ListItem>
					<ListItem>
						<Link to="/mønster">Mønster</Link>
						<UnorderedList aria-label={"elementer"}>
							{patterns.map((pattern) => (
								<ListItem>
									<Link
										to="/mønster/$patternName"
										params={{ patternName: pattern.name }}
									>
										{pattern.name}
									</Link>
								</ListItem>
							))}
						</UnorderedList>
					</ListItem>
				</UnorderedList>
			</nav>
		</header>
	);
};
