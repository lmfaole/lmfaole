import { createFileRoute } from "@tanstack/react-router";
import { Button } from "../components/button/button.tsx";
import {
	CheckboxGroup,
	GroupedMultiselect,
	GroupedSelect,
	Multiselect,
	RadioGroup,
	Select,
} from "../components/input";
import { NumberInput } from "../components/input/number/number.tsx";
import { TextInput } from "../components/input/text/text.tsx";

export const Route = createFileRoute("/components")({
	component: About,
});

function About() {
	const flavors = [
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
	];

	const salaries = [0, 10000, 100000, 1000000];

	return (
		<>
			<h2>Komponenter</h2>
			<ul>
				<li>
					<h3>Knapp</h3>
					<Button>Hei</Button>
				</li>
				<li>
					<h3>Skjemaelementer</h3>
					<ul>
						<li>
							<h4>Tekst</h4>
							<ul>
								<li>
									<h6>Default</h6>
									<TextInput label={"Hvilken smak vil du ha?"} />
								</li>

								<li>
									<h6>Med en dataliste</h6>
									<TextInput
										label={"Hvilken smak vil du ha?"}
										datalist={flavors}
									/>
								</li>
							</ul>
						</li>

						<li>
							<h4>Nummer</h4>
							<ul>
								<li>
									<h6>Default</h6>
									<NumberInput label={"Hvor mye tjener du?"} />
								</li>

								<li>
									<h6>Med en minimum-verdi</h6>
									<NumberInput
										label={"Hvor mye tjener du?"}
										step={1000}
										min={salaries[0]}
										max={salaries[3]}
									/>
								</li>

								<li>
									<h6>Med en nevner</h6>
									<NumberInput
										label={"Hvor mye tjener du?"}
										step={1000}
										suffix={"NOK"}
									/>
								</li>
							</ul>
						</li>

						<li>
							<h4>Radioknapper</h4>
							<RadioGroup
								legend={"Velg tema"}
								items={["Automatisk", "Lyst", "Mørkt"]}
								defaultValue={"Automatisk"}
							/>
						</li>

						<li>
							<h4>Avkrysningsbokser</h4>
							<CheckboxGroup
								legend={"Hvilke smaker liker du?"}
								items={flavors.slice(0, 5)}
								defaultValues={[flavors[0], flavors[3]]}
							/>
						</li>

						<li>
							<h4>Nedtrekkslister</h4>
							<ul>
								<li>
									<h5>Enkel</h5>
									<ul>
										<li>
											<h6>Default</h6>
											<Select
												label={"Hvilken smak vil du ha?"}
												items={flavors}
												defaultValue={flavors[3]}
											/>
										</li>

										<li>
											<h6>Ikke påkrevd</h6>
											<Select
												required={false}
												label={"Hvilken smak vil du ha?"}
												items={flavors}
												defaultValue={flavors[3]}
											/>
										</li>

										<li>
											<h6>Ikke aktiv</h6>
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
									<h5>Gruppert</h5>
									<ul>
										<li>
											<h6>Default</h6>
											<GroupedSelect
												label={"Hvilken smak vil du ha?"}
												groups={groupedFlavors}
												defaultValue={groupedFlavors[1].items[1]}
											/>
										</li>

										<li>
											<h6>Ikke påkrevd</h6>
											<GroupedSelect
												required={false}
												label={"Hvilken smak vil du ha?"}
												groups={groupedFlavors}
												defaultValue={groupedFlavors[1].items[1]}
											/>
										</li>

										<li>
											<h6>Ikke aktiv</h6>
											<GroupedSelect
												disabled
												label={"Hvilken smak vil du ha?"}
												groups={groupedFlavors}
												defaultValue={groupedFlavors[1].items[1]}
											/>
										</li>
									</ul>
								</li>

								<li>
									<h5>Flervalgsliste</h5>
									<ul>
										<li>
											<h6>Default</h6>
											<Multiselect
												label={"Hvilke smaker liker du?"}
												items={flavors}
												defaultValue={[flavors[5], flavors[6]]}
											/>
										</li>

										<li>
											<h6>Ikke påkrevd</h6>
											<Multiselect
												required={false}
												label={"Hvilke smaker liker du?"}
												items={flavors}
												defaultValue={[flavors[5], flavors[6]]}
											/>
										</li>

										<li>
											<h6>Ikke aktiv</h6>
											<Multiselect
												disabled
												label={"Hvilke smaker liker du?"}
												items={flavors}
												defaultValue={[flavors[5], flavors[6]]}
											/>
										</li>
									</ul>
								</li>

								<li>
									<h5>Gruppert flervalgsliste</h5>
									<ul>
										<li>
											<h6>Default</h6>
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

										<li>
											<h6>Ikke påkrevd</h6>
											<GroupedMultiselect
												required={false}
												label={"Hvilke smaker liker du?"}
												groups={groupedFlavors}
												defaultValue={[
													groupedFlavors[0].items[2],
													groupedFlavors[1].items[1],
													groupedFlavors[2].items[0],
												]}
											/>
										</li>

										<li>
											<h6>Ikke aktiv</h6>
											<GroupedMultiselect
												disabled
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
						</li>
					</ul>
				</li>
			</ul>
		</>
	);
}
