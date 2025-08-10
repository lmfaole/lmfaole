import type { ElementInfoType } from "../../element-info.type.ts";
import type { ProgressType } from "./progress.type.ts";

import "./progress.css";

export const Progress = (props: ProgressType) => {
	const { label, ...rest } = props;

	return (
		<label className={"progress"}>
			{label}
			<progress {...rest} />
		</label>
	);
};

export const progressInfo: ElementInfoType = {
	name: "Progress",
	img: <Progress label={"Laster"} />,
	meta: {
		description:
			"The progress element represents the completion progress of a task. The progress is either indeterminate, indicating that progress is being made but that it is not clear how much more work remains to be done before the task is complete (e.g. because the task is waiting for a remote host to respond), or the progress is a number in the range zero to a maximum, giving the fraction of work that has so far been completed.",
		spec: "https://html.spec.whatwg.org/multipage/form-elements.html#the-progress-element",
		category: "skjema",
		aka: ["loader"],
	},
};
