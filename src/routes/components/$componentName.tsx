import { createFileRoute } from "@tanstack/react-router";
import { ComponentExample } from "../../components/documentation/component-example/component-example.tsx";
import componentsList from "./components.list.ts";

export const Route = createFileRoute("/components/$componentName")({
	component: PostComponent,
});

function PostComponent() {
	const { componentName } = Route.useParams();

	const component = componentsList.find((c) => c.name === componentName);

	if (!component) return <h1>Du må ha kommet feil</h1>;

	return (
		<>
			<header>
				<h1>{component.name}</h1>
				<dl>
					<dt>Kategori</dt>
					<dd>{component.category}</dd>
				</dl>
				{component.description && <p>{component.description}</p>}
				<ComponentExample
					title={component.examples[0].title}
					code={component.examples[0].code}
					showTitle={false}
					columns={false}
				/>
			</header>

			<article>
				{component.examples.length >= 2 && (
					<>
						<h2>Eksempler</h2>
						{component.examples.slice(1).map((example) => (
							<ComponentExample resize={"none"} {...example} />
						))}
					</>
				)}
				<footer>
					<h2>Lenker</h2>
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
					</dl>
				</footer>
			</article>
		</>
	);
}
