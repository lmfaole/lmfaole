import { Fragment } from "react";
import type { ElementInfoType } from "../../../../elements/element-info.type.ts";

export const ElementUsage = (element: ElementInfoType) => {
	const { usage } = element;

	if (!usage) return null;

	return (
		<section>
			<h2>Bruksområder</h2>
			{usage.map((use) => (
				<Fragment key={use.title}>
					<h3>{use.title}</h3>
					{use.example}
				</Fragment>
			))}
		</section>
	);
};
