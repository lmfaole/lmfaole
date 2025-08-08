import { Link } from "@tanstack/react-router";

import "./global-header.css";

export const GlobalHeader = () => {
	return (
		<header className={"page-width global-header"}>
			<nav aria-label={"hovednavigasjon"}>
				<ul>
					<li>
						<Link to="/" className="[&.active]:font-bold">
							Hjem
						</Link>
					</li>
					<li>
						<Link to="/elementer" className="[&.active]:font-bold">
							Elementer
						</Link>
					</li>
					<li>
						<Link to="/komponenter" className="[&.active]:font-bold">
							Komponenter
						</Link>
					</li>
					<li>
						<Link to="/mønster" className="[&.active]:font-bold">
							Mønster
						</Link>
					</li>
				</ul>
			</nav>
		</header>
	);
};
