import { createFileRoute, Link } from "@tanstack/react-router";
import { elements, ListItem, UnorderedList } from "../../elements";

export const Route = createFileRoute("/elementer/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<header>
				<h1>Elementer</h1>
				<p>
					Dette er en liste med elementer jeg har jobbet med i arbeidet med{" "}
					<a href={"https://jokul.fremtind.no"}>
						Jøkul, designsystemet til Fremtind
					</a>
					.
				</p>
				<p>
					Vi produserer mye i lukka miljøer, med få tilgjengelige test-enheter.
					Mye av poenget med dette prosjektet er derfor å få ut noe fort, se hva
					web-plattformen gir oss gratis, og legge til funksjonalitet der det
					kreves.
				</p>
				<p>
					I tillegg er dette et veldig godt sted for meg å se hva som må gjøres
					for å sikre universell utforming i bruk av ulike elementer.
				</p>
				<aside>
					<p>
						Lista er åpenbart ufullstendig, men vil (forhåpentligvis) vokse.
					</p>
				</aside>
			</header>
			<section>
				<h2>Lista</h2>
				<UnorderedList aria-label={"Komponentliste"}>
					{elements.map((element) => (
						<ListItem key={element.name}>
							<Link
								to={"/elementer/$elementName"}
								params={{ elementName: element.name }}
							>
								{element.name}
							</Link>
						</ListItem>
					))}
				</UnorderedList>
			</section>
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
