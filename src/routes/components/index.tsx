import { createFileRoute } from "@tanstack/react-router";
import { ComponentItem } from "../../components/documentation/component-item/component-item.tsx";
import componentList from "./components.list.ts";

export const Route = createFileRoute("/components/")({
	component: ComponentListPage,
});

function ComponentListPage() {
	const groupedComponents = Object.groupBy(
		componentList,
		({ category }) => category,
	);

	if (!groupedComponents)
		return (
			<>
				<h1>Komponenter</h1>
				<ul className={"list-style-none"}>
					{componentList.map((component) => (
						<ComponentItem key={component.name} {...component} />
					))}
				</ul>
			</>
		);

	return (
		<>
			<h1>Komponenter</h1>
			<ul className={"list-style-none"}>
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

				{groupedComponents.handlinger && (
					<li>
						<h2>Handlinger</h2>
						<ul>
							{groupedComponents.handlinger.map((component) => (
								<ComponentItem key={component.name} {...component} />
							))}
						</ul>
					</li>
				)}

				{groupedComponents.skjemaelementer && (
					<li>
						<h2>Skjemaelementer</h2>
						<ul>
							{groupedComponents.skjemaelementer.map((component) => (
								<ComponentItem key={component.name} {...component} />
							))}
						</ul>
					</li>
				)}

				{groupedComponents.dokumentasjon && (
					<li>
						<h2>Dokumentasjon</h2>
						<p>En samling med komponenter brukt for å lage denne siden.</p>
						<ul>
							{groupedComponents.dokumentasjon.map((component) => (
								<ComponentItem key={component.name} {...component} />
							))}
						</ul>
					</li>
				)}
			</ul>
		</>
	);
}
