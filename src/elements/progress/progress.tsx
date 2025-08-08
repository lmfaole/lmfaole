import type { ElementInfoType } from "../element-info.type.ts";
import type { ProgressType } from "./progress.type.ts";

import "./progress.css";

export const Progress = (props: ProgressType) => {
	const { label, ...rest } = props;

	return (
		<label>
			{label}
			<progress {...rest} />
		</label>
	);
};

export const progressInfo: ElementInfoType = {
	name: "Progress",
	example: <Progress label={"Laster"} />,
};
