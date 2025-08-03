import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ComponentItem } from "../../components/documentation/component-item/component-item.tsx";
import { SearchInput } from "../../components/input";
import componentList from "./components.list.ts";

export const Route = createFileRoute("/components/")({
	component: ComponentListPage,
});

function ComponentListPage() {
	const [search, setSearch] = useState("");
	const [filteredComponents, setFilteredComponents] = useState(componentList);

	const groupedComponents = Object.groupBy(
		filteredComponents,
		({ category }) => category,
	);

	useEffect(() => {
		const searchString = search.toLowerCase();

		setFilteredComponents(
			componentList.filter(
				(item) =>
					item.name.toLowerCase().includes(searchString) ||
					item.description?.toLowerCase().includes(searchString),
			),
		);
	}, [search]);

	return (
		<>
			<h1>Komponenter</h1>
			<search>
				<SearchInput
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					datalist={filteredComponents.map((com) => com.name)}
					autoComplete={"on"}
				/>
			</search>
			{filteredComponents.length ? (
				<ul className={"list-style-none"}>
					{groupedComponents ? (
						<>
							{groupedComponents.layout && (
								<li>
									<h2>Layout</h2>
									<ul>
										{groupedComponents.layout.map((component) => (
											<ComponentItem key={component.name} {...component} />
										))}
									</ul>
								</li>
							)}
							{groupedComponents.handling && (
								<li>
									<h2>Handlinger</h2>
									<ul>
										{groupedComponents.handling.map((component) => (
											<ComponentItem key={component.name} {...component} />
										))}
									</ul>
								</li>
							)}
							{groupedComponents.skjema && (
								<li>
									<h2>Skjemaelementer</h2>
									<ul>
										{groupedComponents.skjema.map((component) => (
											<ComponentItem key={component.name} {...component} />
										))}
									</ul>
								</li>
							)}
							{groupedComponents.dokumentasjon && (
								<li>
									<h2>Dokumentasjon</h2>
									<p>
										En samling med komponenter brukt for å lage denne siden.
									</p>
									<ul>
										{groupedComponents.dokumentasjon.map((component) => (
											<ComponentItem key={component.name} {...component} />
										))}
									</ul>
								</li>
							)}
							{groupedComponents.tekst && (
								<li>
									<h2>Tekst</h2>
									<ul>
										{groupedComponents.tekst.map((component) => (
											<ComponentItem key={component.name} {...component} />
										))}
									</ul>
								</li>
							)}
						</>
					) : (
						<>
							{componentList.map((component) => (
								<ComponentItem key={component.name} {...component} />
							))}
						</>
					)}
				</ul>
			) : (
				<p>Ingen resultater</p>
			)}
		</>
	);
}
