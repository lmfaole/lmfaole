import { createFileRoute } from "@tanstack/react-router";
import { renderToStaticMarkup } from "react-dom/server";
import { Details } from "../../components/details";
import { Resizer } from "../../components/layout/resizer/resizer.tsx";
import componentsList from "./components.list.ts";

export const Route = createFileRoute("/components/$componentName")({
	component: PostComponent,
});

function PostComponent() {
	const { componentName } = Route.useParams();

	const component = componentsList.find((c) => c.name === componentName);

	if (!component) return <p>Du må ha kommet feil</p>;

	return (
		<>
			<header>
				<h1>{component.name}</h1>
				{component.description && <p>{component.description}</p>}
				<Resizer figcaption={"Button"} resize={"vertical"}>
					{component.example}
				</Resizer>
				<Details summary={"React"}>
					<output>
						<pre>
							<code>{renderToStaticMarkup(component.example)}</code>
						</pre>
					</output>
				</Details>
			</header>

			<article>
				<footer>
					<h2>Lenker</h2>
					<ul>
						{component.spec && (
							<li>
								<a href={component.spec}>HTML Spec</a>
							</li>
						)}
						{component.docs && (
							<li>
								<a href={component.docs}>MDN docs</a>
							</li>
						)}
					</ul>
				</footer>
			</article>
		</>
	);
}
