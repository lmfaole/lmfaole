import type { ElementInfoType } from "../../element-info.type.ts";

export const progressInfo: ElementInfoType = {
	name: "Progress",
	description:
		"The progress element represents the completion progress of a task. The progress is either indeterminate, indicating that progress is being made but that it is not clear how much more work remains to be done before the task is complete (e.g. because the task is waiting for a remote host to respond), or the progress is a input-number in the input-range zero to a maximum, giving the fraction of work that has so far been completed.",
	spec: "https://html.spec.whatwg.org/multipage/form-elements.html#the-progress-element",
	category: "skjema",
	aliases: ["loader"],
};
