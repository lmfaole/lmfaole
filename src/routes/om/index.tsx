import { createFileRoute } from "@tanstack/react-router";
import { ListItem, UnorderedList } from "../../elements";

export const Route = createFileRoute("/om/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main>
			<h1>Om</h1>
			<section>
				<h2>Om meg</h2>
				<p>
					I dag jobber jeg som utvikler på{" "}
					<a href="https://jokul.fremtind.no">Jøkul-teamet</a> i{" "}
					<a href="https://fremtind.no">Fremtind Forsikring</a>. Tidligere har
					jeg jobba som designer i team{" "}
					<a href="aksel.nav.no">Aksel, designsystemet til NAV</a>.
				</p>

				<h3>Mine interesseområder i jobben min</h3>
				<UnorderedList aria-label="Interesser på jobb">
					<ListItem>CSS og HTML ❤️</ListItem>
					<ListItem>Tilgjengelighet</ListItem>
					<ListItem>Designsystem</ListItem>
					<ListItem>Web-standarder</ListItem>
				</UnorderedList>

				<h3>Mine interesseområder utenfor jobben min</h3>
				<UnorderedList aria-label="Interesser utenfor jobb">
					<ListItem>
						Klatring{" "}
						<span className="muted">
							(eller buldring, som seriøse klatrere insisterer på å minne meg på
							at det heter)
						</span>
					</ListItem>
					<ListItem>Styrketrening</ListItem>
					<ListItem>Film, aller helst på kino</ListItem>
					<ListItem>Musikk, aller helst på konsert</ListItem>
				</UnorderedList>

				<h3>Meg andre steder</h3>
				<UnorderedList aria-label={"Mine lenker"}>
					<ListItem>
						<a
							href={"https://bsky.app/profile/lmfaole.party"}
							rel={"me"}
							lang="en"
						>
							Bluesky
						</a>
					</ListItem>
					<ListItem>
						<a href={"https://goodreads.com/lmfaole"} rel={"me"} lang="en">
							Goodreads
						</a>
					</ListItem>
					<ListItem>
						<a href={"https://letterboxd.com/lmfaole/"} rel={"me"} lang="en">
							Letterboxd
						</a>
					</ListItem>
					<ListItem>
						<a href={"https://last.fm/user/snowpony69"} rel={"me"} lang="en">
							Last.fm
						</a>
					</ListItem>
					<ListItem>
						<a href={"https://github.com/lmfaole"} rel={"me"} lang="en">
							Github
						</a>
					</ListItem>
					<ListItem>
						<a
							href={"https://www.linkedin.com/in/olejorgenbakken/"}
							rel={"me"}
							lang="en"
						>
							LinkedIn
						</a>
					</ListItem>
				</UnorderedList>
			</section>
			<section>
				<h2>Om dette nettstedet</h2>
				<p>
					Som nevnt jobber jeg i Fremtind. Vi produserer mye i lukka miljøer,
					med få tilgjengelige test-enheter. Mye av poenget med dette prosjektet
					er derfor å få ut noe fort, se hva web-plattformen gir oss gratis, og
					legge til funksjonalitet der det kreves.
				</p>
				<h3>Metadata om dette nettstedet</h3>
				<UnorderedList aria-label="Infomrasjon om nettsiden">
					<ListItem>
						<a href="https://www.websitecarbon.com/website/lmfaole-party/">
							Dette nettstedet har A+ gradering hos Website Carbon Calculator
						</a>
						. Det er kanskje å forvente av en nettside som knapt henter data noe
						sted, men men.
					</ListItem>
					<ListItem>
						Dette nettstedet{" "}
						<a href="https://sprakradet.no/godt-og-korrekt-sprak/ordlister-og-ordboker/pa-godt-norsk-avloserord/">
							driftes (språkrådet?)
						</a>{" "}
						på{" "}
						<a href="https://www.thegreenwebfoundation.org/green-web-check/?url=lmfaole.party">
							grønt nivå av Cloudflare ifølge{" "}
							<span lang="en">Green Web Foundtaion</span>
						</a>
						.
					</ListItem>
					<ListItem>
						Jeg er ikke så glad i <span lang="en">React</span>, men den er
						allikevel bygd med det. <span lang="en">Dogfood-ing</span> eller
						noe. For å gjøre dette bruker jeg følgende støtteverktøy:
						<UnorderedList aria-label="Teknologi brukt for å lage nettsiden">
							<ListItem>
								<a href="https://tanstack.com/router/latest">TanStack Router</a>{" "}
								som router-løsning
							</ListItem>

							<ListItem>
								<a href="https://biomejs.dev/">BiomeJs</a> som linter
							</ListItem>

							<ListItem>
								<a href="https://aksel.nav.no/komponenter/ikoner">Aksel</a> for
								ikoner
							</ListItem>
						</UnorderedList>
					</ListItem>
				</UnorderedList>
			</section>
		</main>
	);
}
