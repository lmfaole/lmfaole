import { createFileRoute } from "@tanstack/react-router";
import { components } from "../../components";
import { ComponentExample } from "../../components/component-example/component-example.tsx";

export const Route = createFileRoute("/komponenter/$componentName")({
	component: ComponentPage,
});

function ComponentPage() {
	const { componentName } = Route.useParams();

	const component = components.find(
		(component) => component.name === componentName,
	);

	if (!component) return <h1>Du må ha kommet feil</h1>;

	return (
		<main>
			<article className={"page"}>
				<header>
					<h1>{component.name}</h1>
					<ComponentExample
						title={"Grunnstil"}
						interactive={true}
						showMarkup={true}
					>
						{component.example}
					</ComponentExample>
				</header>

				{/*	<h2>Om komponenten</h2>
				<dl className={"metadata"}>
					<dt>Kategori</dt>
					<dd>{component.category}</dd>
				</dl>*/}

				{/*{component.examples && (
					<div>
						<h2>Eksempler</h2>
						{component.examples.map((example) => (
							<ComponentExample
								key={example.title}
								interactive={true}
								{...example}
							/>
						))}
					</div>
				)}*/}
			</article>
		</main>
	);
}
