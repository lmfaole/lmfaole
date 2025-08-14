import type { ElementInfoType } from "../../../../elements/element-info.type.ts";

export const ElementExample = (element: ElementInfoType) => {
	const { img } = element;

	return (
		<section>
			<h2>Eksempel</h2>

			<div className={"example"}>
				<div>{img}</div>
			</div>
		</section>
	);
};
