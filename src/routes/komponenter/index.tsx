import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { componentList, SearchInput } from "../../components";

export const Route = createFileRoute("/komponenter/")({
	component: ComponentListPage,
});

function ComponentListPage() {
	const [search, setSearch] = useState("");
	const [filteredComponents, setFilteredComponents] = useState(componentList);

	/*const groupedComponents = Object.groupBy(
		filteredComponents,
		({ category }) => category,
	);*/

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
		<main>
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
				<ul>
					{componentList.map((component) => (
						<li>
							<Link
								to={"/komponenter/$componentName"}
								params={{ componentName: component.name }}
							>
								{component.name}
							</Link>
						</li>
					))}
				</ul>
			) : (
				<p>Ingen resultater</p>
			)}
		</main>
	);
}
