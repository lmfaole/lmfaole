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
							<ul style={{ columns: 2 }}>
								<li>
									<h5>Enkel</h5>
									<Select
										legend={"Hvilken smak vil du ha?"}
										items={flavors}
										defaultValue={flavors[3]}
									/>
								</li>

								<li>
									<h5>Gruppert</h5>
									<GroupedSelect
										legend={"Hvilken smak vil du ha?"}
										groups={groupedFlavors}
										defaultValue={groupedFlavors[1].items[1]}
									/>
								</li>

								<li>
									<h5>Flervalgsliste</h5>
									<Multiselect
										legend={"Hvilke smaker liker du?"}
										items={flavors}
										defaultValue={[flavors[5], flavors[6]]}
									/>
								</li>

								<li>
									<h5>Gruppert flervalgsliste</h5>
									<GroupedMultiselect
										legend={"Hvilke smaker liker du?"}
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
		</>
	);
}
