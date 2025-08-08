import type { ElementInfoType } from "../element-info.type.ts";
import type { ProgressType } from "./progress.type.ts";

import "./progress.css";

export const Progress = (props: ProgressType) => {
	const { label, ...rest } = props;

	return (
		<div className={"progress"}>
			<label id={`${label}-progress`}>{label}</label>
			<progress aria-labelledby={`${label}-progress`} {...rest} />
		</div>
	);
};

export const progressInfo: ElementInfoType = {
	name: "Progress",
	example: <Progress label={"Laster..."} />,
};
