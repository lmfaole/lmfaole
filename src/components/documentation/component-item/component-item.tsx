import { Link } from "@tanstack/react-router";
import type { ComponentInfoTypes } from "../../component-info.type.ts";

import "./component-item.css";
import type { AllHTMLAttributes } from "react";

export const ComponentItem = (
	props: ComponentInfoTypes & AllHTMLAttributes<HTMLLIElement>,
) => {
	const { name, description, ...rest } = props;

	return (
		<li {...rest}>
			<h2>
				<Link
					to={`/components/$componentName`}
					params={{ componentName: name }}
				>
					{name}
				</Link>
			</h2>
			{description && <p>{description}</p>}
		</li>
	);
};

export const componentItemInfo: ComponentInfoTypes = {
	name: "Component Item",
	category: "dokumentasjon",
};
