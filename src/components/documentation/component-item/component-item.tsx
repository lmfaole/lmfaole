import { Link } from "@tanstack/react-router";
import type { ComponentInfoTypes } from "../../component-info.type.ts";
import { componentList } from "../../index.ts";

import "./component-item.css";

export const ComponentItem = ({ name, description }: ComponentInfoTypes) => {
	const component = componentList.find((component) => name === component.name);

	return (
		<li className="component-item">
			<div>
				<div className="info">
					<p className="h3 name">
						<Link
							to={`/components/$componentName`}
							params={{ componentName: name }}
							className="h3"
						>
							{name}
						</Link>
					</p>
					{description && <p className={"h4"}>{description}</p>}
				</div>
				<div inert className="image">
					{component?.base}
				</div>
			</div>
		</li>
	);
};

export const componentItemInfo: ComponentInfoTypes = {
	name: "Component Item",
	category: "dokumentasjon",
	base: (
		<ComponentItem
			name={"Komponent Card"}
			category={"dokumentasjon"}
			base={undefined}
		/>
	),
};
