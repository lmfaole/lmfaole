import { createFileRoute } from "@tanstack/react-router";
/*import { components } from "../../components";*/

export const Route = createFileRoute("/komponenter/")({
	component: ComponentListPage,
});

function ComponentListPage() {
	return (
		<main>
			<header>
				<h1>Komponenter</h1>
				<p>
					Foreløpig har jeg ikke hatt gleden (?) av å måtte lage et
					egenkomponert element. Kommer vel snart.
				</p>
				<aside>
					<p>
						Personlig er jeg ikke så glad i navnet komponenter, men dette kommer
						jeg sikkert til å skrive noe mer om på et tidspunkt 🤞
					</p>
				</aside>
			</header>
			{/*<ul>
				{components.map((component) => (
					<li>
						<Link
							to={"/komponenter/$componentName"}
							params={{ componentName: component.name }}
						>
							{component.name}
						</Link>
					</li>
				))}
			</ul>*/}
		</main>
	);
}
