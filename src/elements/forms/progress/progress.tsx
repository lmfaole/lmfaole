import { useId } from "react";
import type { ProgressType } from "./progress.type.ts";

export const Progress = (props: ProgressType) => {
	const { label, ...rest } = props;
	const id = useId();

	return (
		<>
			<label htmlFor={`${label}-${id}-progress`}>{label}</label>
			<progress id={`${label}-${id}-progress`} {...rest}></progress>
		</>
	);
};
