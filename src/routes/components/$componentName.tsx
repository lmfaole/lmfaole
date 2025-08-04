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

	const relatedComponents = componentList.filter(
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
						<h2>Andre {component.category} komponenter</h2>
						<ul className={"list-style-none"}>
							{relatedComponents.map((item) => (
								<ComponentItem key={item.name} {...item} />
							))}
						</ul>
					</>
				)}
			</footer>
		</article>
	);
}
