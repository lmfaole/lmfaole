import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, buttonInfo } from "../../components/button";
import type { ComponentInfo } from "../../components/component-info.type.ts";
import { Details } from "../../components/details";
import { Resizer } from "../../components/layout/resizer/resizer.tsx";
export const Route = createFileRoute("/components/$componentName")({
	component: PostComponent,
});

function PostComponent() {
	const { componentName } = Route.useParams();
	const [component, setComponent]: ComponentInfo = useState();

	useEffect(() => {
		(async () => {
			const ding = await import(`../../components/${componentName}`).then(
				(e) => e.default,
			);
			setComponent(ding);
			console.log(ding);
		})();
	}, []);

	if (!component) return;

	return (
		<>
			<header>
				<h1>{component.name}</h1>
				{component.description && <p>{buttonInfo.description}</p>}
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
