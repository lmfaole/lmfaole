import { createFileRoute, Link } from "@tanstack/react-router";
import { elements, ListItem, UnorderedList } from "../../elements";

export const Route = createFileRoute("/elementer/")({
	component: RouteComponent,
});

function RouteComponent() {
	const groupedElements = Object.groupBy(elements, ({ category }) => category);

	const formatPluralExamples = (n?: number) => {
		if (!n) return "Ingen eksempler";

		const enOrdinalRules = new Intl.PluralRules("no", { type: "cardinal" });

		const suffixes = new Map([
			["one", "eksempel"],
			["two", "eksempler"],
			["few", "eksempler"],
			["other", "eksempler"],
		]);

		const rule = enOrdinalRules.select(n);
		const suffix = suffixes.get(rule);
		return `${n} ${suffix}`;
	};

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
				<h2>Grupperingselementer</h2>
				<UnorderedList aria-label={"Grupperingselementer"}>
					{groupedElements.gruppering?.map((element) => (
						<ListItem key={element.name}>
							<p>
								<Link
									to={"/elementer/$elementName"}
									params={{ elementName: element.name }}
								>
									{element.name}
								</Link>{" "}
								<small className="muted">
									({formatPluralExamples(element.examples?.length)})
								</small>
							</p>
						</ListItem>
					))}
				</UnorderedList>

				<h2>Skjemaelementer</h2>
				<UnorderedList aria-label={"Skjemaelementer"}>
					{groupedElements.skjema?.map((element) => (
						<ListItem key={element.name}>
							<p>
								<Link
									to={"/elementer/$elementName"}
									params={{ elementName: element.name }}
								>
									{element.name}
								</Link>{" "}
								<small className="muted">
									({formatPluralExamples(element.examples?.length)})
								</small>
							</p>
						</ListItem>
					))}
				</UnorderedList>

				<h2>Tabulær data</h2>
				<UnorderedList aria-label={"Tabulær data"}>
					{groupedElements["tabulær data"]?.map((element) => (
						<ListItem key={element.name}>
							<p>
								<Link
									to={"/elementer/$elementName"}
									params={{ elementName: element.name }}
								>
									{element.name}
								</Link>{" "}
								<small className="muted">
									({formatPluralExamples(element.examples?.length)})
								</small>
							</p>
						</ListItem>
					))}
				</UnorderedList>

				<h2>Interaksjon</h2>
				<UnorderedList aria-label={"Interaksjonselementer"}>
					{groupedElements.interaksjon?.map((element) => (
						<ListItem key={element.name}>
							<p>
								<Link
									to={"/elementer/$elementName"}
									params={{ elementName: element.name }}
								>
									{element.name}
								</Link>{" "}
								<small className="muted">
									({formatPluralExamples(element.examples?.length)})
								</small>
							</p>
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
