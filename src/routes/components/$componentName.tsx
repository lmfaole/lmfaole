import { createFileRoute } from "@tanstack/react-router";
import { renderToStaticMarkup } from "react-dom/server";
import {
	ComponentExample,
	ComponentItem,
	componentList,
} from "../../components";

export const Route = createFileRoute("/components/$componentName")({
	component: ComponentPage,
});

function ComponentPage() {
	const { componentName } = Route.useParams();

	const component = componentList.find((c) => c.name === componentName);

	if (!component) return <h1>Du må ha kommet feil</h1>;

	const categoryComponents = componentList.filter(
		(item) => item.category === component.category,
	);

	return (
		<main>
			<article className={"page"}>
				<header>
					<h1>{component.name}</h1>
					{component.description && <p>{component.description}</p>}
					<ComponentExample
						title={component.name}
						showTitle={false}
						columns={false}
						open={renderToStaticMarkup(component.base).length <= 250}
					>
						{component.base}
					</ComponentExample>
				</header>

				{component.examples && component.examples.length >= 2 && (
					<div>
						<h2>Eksempler</h2>
						{component.examples.map((example) => (
							<ComponentExample
								key={example.title}
								resize={"none"}
								columns={true}
								{...example}
							/>
						))}
					</div>
				)}

				<aside>
					<h2>Om komponenten</h2>
					<dl className={"metadata"}>
						<dt>Kategori</dt>
						<dd>{component.category}</dd>
					</dl>

					{!!categoryComponents.length && (
						<>
							<h2>Andre komponenter i samme kategori</h2>
							<ul className={"list-style-none"}>
								{categoryComponents.map((item) => (
									<ComponentItem key={item.name} {...item} />
								))}
							</ul>
						</>
					)}
				</aside>
			</article>
		</main>
	);
}
