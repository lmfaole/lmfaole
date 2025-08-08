import type { ComponentInfoTypes } from "../component-info.type.ts";
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

export const progressInfo: ComponentInfoTypes = {
	name: "Progress",
	category: "layout",
	base: <Progress label={"Laster..."} />,
};
