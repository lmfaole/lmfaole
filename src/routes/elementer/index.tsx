import { createFileRoute, Link } from "@tanstack/react-router";
import { elements, ListItem, UnorderedList } from "../../elements";

export const Route = createFileRoute("/elementer/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1>Elementer</h1>
			<p>
				Dette er en liste med elementer jeg har jobbet med i arbeidet med{" "}
				<a href={"https://jokul.fremtind.no"}>
					Jøkul, designsystemet til Fremtind
				</a>
				.
			</p>
			<p>
				Vi produserer mye i lukka miljøer, med få tilgjengelige test-enheter. Mye av poenget med dette prosjektet er derfor å få ut noe fort, se hva web-plattformen
				gir oss gratis, og legge til funksjonalitet der det kreves for å dekke brukerbehovene ute i
				teamene.
			</p>
			<p>
				<aside>
					Lista er åpenbart ufullstendig, men vil (forhåpentligvis) vokse.
				</aside>
			</p>
			<h2>Lista</h2>
			<UnorderedList>
				{elements.map((element) => (
					<ListItem>
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
					</ListItem>
				))}
			</UnorderedList>
			<footer>
				<h2>Referanser</h2>
				<p>
					Informasjonen om elementene er hovedsaklig hentet fra{" "}
					<a
						href={
							"https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements"
						}
					>
						MDN
					</a>{" "}
					og <a href={"https://html.spec.whatwg.org/"}>HTML spesifikasjonen</a>.
				</p>
			</footer>
		</main>
	);
}
