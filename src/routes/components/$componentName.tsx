import { createFileRoute } from "@tanstack/react-router";
import { renderToStaticMarkup } from "react-dom/server";
import { ComponentExample } from "../../components/documentation/component-example/component-example.tsx";
import { ComponentItem } from "../../components/documentation/component-item/component-item.tsx";
import componentsList from "./components.list.ts";

export const Route = createFileRoute("/components/$componentName")({
	component: ComponentPage,
});

function ComponentPage() {
	const { componentName } = Route.useParams();

	const component = componentsList.find((c) => c.name === componentName);

	if (!component) return <h1>Du må ha kommet feil</h1>;

	const firstExample = component.examples && component.examples[0];
	const relatedComponents = componentsList.filter(
		(item) =>
			item.category === component.category && item.name !== component.name,
	);

	return (
		<article>
			<header>
				<h1>{component.name}</h1>
				<dl>
					<dt>Kategori</dt>
					<dd>{component.category}</dd>
				</dl>
				{component.description && <p>{component.description}</p>}
				{firstExample && firstExample.code && (
					<ComponentExample
						title={firstExample.title}
						code={firstExample.code}
						showTitle={false}
						columns={false}
						open={renderToStaticMarkup(firstExample?.code).length <= 250}
					/>
				)}
			</header>

			{component.examples && component.examples.length >= 2 && (
				<>
					<h2>Eksempler</h2>
					{component.examples.slice(1).map((example) => (
						<ComponentExample
							key={example.title}
							resize={"none"}
							columns={true}
							{...example}
						/>
					))}
				</>
			)}
			<footer>
				{/*<h2>Lenker</h2>
				<dl>
					<dt>HTML spesifikasjon</dt>
					{component.spec && (
						<dd>
							<a href={component.spec}>HTML Spec</a>
						</dd>
					)}
					{component.docs && (
						<dd>
							<a href={component.docs}>MDN docs</a>
						</dd>
					)}
				</dl>*/}

				{!!relatedComponents.length && (
					<>
						<h2>Relaterte komponenter</h2>
						<ul className={"list-style-none"}>
							{relatedComponents.map((item) => (
								<ComponentItem {...item} />
							))}
						</ul>
					</>
				)}
			</footer>
		</article>
	);
}
