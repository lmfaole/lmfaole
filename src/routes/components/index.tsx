import { createFileRoute, Link } from "@tanstack/react-router";
import componentList from "../../components/components.list.ts";

export const Route = createFileRoute("/components/")({
	component: About,
});

function About() {
	/*const flavors = [
		"Sjokolade",
		"Dubai-sjokolade",
		"Mint-sjokolade",
		"Jordbær",
		"Pistasj",
		"Karamell",
		"Banan",
		"Blåbær",
		"Kinder",
		"Smash",
		"Sorbet",
	];
	const groupedFlavors = [
		{
			label: "Sjokolade",
			items: ["Vanlig", "Dubai-sjokolade", "Mint-sjokolade"],
		},
		{
			label: "Sorbet",
			items: ["Mango", "Annanas", "Eple", "Kiwi"],
		},
		{
			label: "Annet",
			items: ["Jordbær", "Pistasj", "Karamell", "Banan"],
		},
	];*/

	return (
		<>
			<h1>Komponenter</h1>
			<ul>
				{componentList.map((component) => (
					<li key={component.name}>
						<h2>
							{/* @ts-ignore*/}
							<Link to={`/components/${component.name}`}>{component.name}</Link>
						</h2>
						<p>{component.description}</p>
					</li>
				))}
			</ul>
			{/*<ul>
				<li>
					<h2>
						<Link to={"/components/button"}>Knapp</Link>
					</h2>
					<Button>Hei</Button>
				</li>
				<li>
					<h2>Skjemaelementer</h2>
					<form>
						<ul>
							<li>
								<h3>Tekst</h3>
								<ul>
									<li>
										<h4>Default</h4>
										<TextInput label={"Hvilken smak vil du ha?"} />
									</li>

									<li>
										<h4>Med en dataliste</h4>
										<TextInput
											label={"Hvilken smak vil du ha?"}
											datalist={flavors}
										/>
									</li>
								</ul>
							</li>

							<li>
								<h3>Nummer</h3>
								<ul>
									<li>
										<h4>Default</h4>
										<NumberInput label={"Hvor mye tjener du?"} />
									</li>

									<li>
										<h4>Med en minimum-verdi</h4>
										<NumberInput
											label={"Hva har du på konto?"}
											step={1}
											min={20}
										/>
									</li>

									<li>
										<h4>Med en nevner</h4>
										<NumberInput
											label={"Hvor høy er du?"}
											step={1}
											min={100}
											max={240}
											suffix={"cm"}
										/>
									</li>
								</ul>
							</li>

							<li>
								<h4>Telefon</h4>
								<ul>
									<li>
										<h5>Default</h5>
										<TelInput />
									</li>

									<li>
										<h5>Med landskode</h5>
										<TelInput autoComplete={"tel"} />
									</li>
								</ul>
							</li>

							<li>
								<h4>Kortinformasjon</h4>

								<CardInput />
							</li>

							<li>
								<h3>Radioknapper</h3>
								<RadioGroup
									legend={"Velg tema"}
									items={["Automatisk", "Lyst", "Mørkt"]}
									defaultValue={"Automatisk"}
								/>
							</li>

							<li>
								<h3>Avkrysningsbokser</h3>
								<CheckboxGroup
									legend={"Hvilke smaker liker du?"}
									items={flavors.slice(0, 5)}
									defaultValues={[flavors[0], flavors[3]]}
								/>
							</li>

							<li>
								<h3>Nedtrekkslister</h3>
								<ul>
									<li>
										<h4>Enkel</h4>
										<ul>
											<li>
												<h5>Default</h5>
												<Select
													label={"Hvilken smak vil du ha?"}
													items={flavors}
													defaultValue={flavors[3]}
												/>
											</li>

											<li>
												<h5>Ikke aktiv</h5>
												<Select
													disabled
													label={"Hvilken smak vil du ha?"}
													items={flavors}
													defaultValue={flavors[3]}
												/>
											</li>
										</ul>
									</li>

									<li>
										<h4>Gruppert</h4>
										<GroupedSelect
											label={"Hvilken smak vil du ha?"}
											groups={groupedFlavors}
											defaultValue={groupedFlavors[1].items[1]}
										/>
									</li>

									<li>
										<h4>Flervalgsliste</h4>
										<Multiselect
											label={"Hvilke smaker liker du?"}
											items={flavors}
											defaultValue={[flavors[5], flavors[6]]}
										/>
									</li>

									<li>
										<h4>Gruppert flervalgsliste</h4>
										<GroupedMultiselect
											label={"Hvilke smaker liker du?"}
											groups={groupedFlavors}
											defaultValue={[
												groupedFlavors[0].items[2],
												groupedFlavors[1].items[1],
												groupedFlavors[2].items[0],
											]}
										/>
									</li>
								</ul>
							</li>
						</ul>
					</form>
				</li>
			</ul>*/}
		</>
	);
}
