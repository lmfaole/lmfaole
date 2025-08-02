import { createFileRoute } from "@tanstack/react-router";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, buttonInfo } from "../../components/button";
import { Details } from "../../components/details";
import { Resizer } from "../../components/layout/resizer/resizer.tsx";

export const Route = createFileRoute("/component/button")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<header>
				<h1>{buttonInfo.name}</h1>
				{buttonInfo.description && <p>{buttonInfo.description}</p>}
				<Resizer figcaption={"Button"} resize={"vertical"}>
					{buttonInfo.example}
				</Resizer>
				<Details summary={"React"}>
					<output>
						<pre>
							<code>{renderToStaticMarkup(buttonInfo.example)}</code>
						</pre>
					</output>
				</Details>
			</header>

			<article>
				<h2>Use cases</h2>

				<ul>
					<li>
						<h3>Sending av skjema</h3>
						<Button>Send</Button>
					</li>

					<li>
						<h3>Vise mulige handlinger</h3>
						<Button disabled>Send</Button>
					</li>
				</ul>
				<footer>
					<h2>Lenker</h2>
					<ul>
						{buttonInfo.spec && (
							<li>
								<a href={buttonInfo.spec}>HTML Spec</a>
							</li>
						)}
						{buttonInfo.docs && (
							<li>
								<a href={buttonInfo.docs}>MDN docs</a>
							</li>
						)}
					</ul>
				</footer>
			</article>
		</>
	);
}
