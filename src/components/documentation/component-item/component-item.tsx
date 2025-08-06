import { Link } from "@tanstack/react-router";
import type { AllHTMLAttributes } from "react";
import type { ComponentInfoTypes } from "../../component-info.type.ts";

export const ComponentItem = (
	props: Pick<ComponentInfoTypes, "name" | "description"> &
		AllHTMLAttributes<HTMLLIElement>,
) => {
	const { name, description, ...rest } = props;

	return (
		<li {...rest}>
			<p>
				<Link
					to={`/components/$componentName`}
					params={{ componentName: name }}
				>
					{name}
				</Link>
			</p>
			{description && <p>{description}</p>}
		</li>
	);
};

export const componentItemInfo: ComponentInfoTypes = {
	name: "Component Item",
	category: "dokumentasjon",
	base: <ComponentItem name={"Komponent Card"} />,
};
