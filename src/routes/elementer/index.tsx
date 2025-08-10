import { createFileRoute, Link } from "@tanstack/react-router";
import { elements } from "../../elements";

export const Route = createFileRoute("/elementer/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1>Elementer</h1>
			<ul>
				{elements.map((element) => (
					<li>
						<p>
							<Link
								to={"/elementer/$elementName"}
								params={{ elementName: element.name }}
							>
								{element.name}
							</Link>
						</p>
						{/*{element.meta.aka && (
							<p>
								Også kjent som <i>{element.meta.aka?.join(", ")}</i>.
							</p>
						)}
						{element.playground && (
							<p className={"muted p"}>Har egenskapsoversikt.</p>
						)}
						{element.usage?.length && (
							<p className={"muted p"}>
								{element.usage.length} eksempler på bruk.
							</p>
						)}*/}
					</li>
				))}
			</ul>
		</main>
	);
}
