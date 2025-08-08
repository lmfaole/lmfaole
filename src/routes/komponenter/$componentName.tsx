import { createFileRoute } from "@tanstack/react-router";
import { ComponentExample, componentList } from "../../components";

export const Route = createFileRoute("/komponenter/$componentName")({
	component: ComponentPage,
});

function ComponentPage() {
	const { componentName } = Route.useParams();

	const component = componentList.find((c) => c.name === componentName);

	if (!component) return <h1>Du må ha kommet feil</h1>;

	return (
		<main>
			<article className={"page"}>
				<header>
					<h1>{component.name}</h1>
					{component.description && <p>{component.description}</p>}
					<ComponentExample
						title={"Grunnstil"}
						interactive={true}
						showMarkup={true}
					>
						{component.base}
					</ComponentExample>
				</header>

				<h2>Om komponenten</h2>
				<dl className={"metadata"}>
					<dt>Kategori</dt>
					<dd>{component.category}</dd>
				</dl>

				{component.examples && (
					<div>
						<h2>Eksempler</h2>
						<ul>
							{component.examples.map((example) => (
								<li>
									<ComponentExample
										key={example.title}
										interactive={true}
										{...example}
									/>
								</li>
							))}
						</ul>
					</div>
				)}
			</article>
		</main>
	);
}
