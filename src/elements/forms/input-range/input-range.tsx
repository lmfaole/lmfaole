import { useId } from "react";
import type { InputRangeType } from "./input-range.type.ts";

export const InputRange = (props: InputRangeType) => {
	const { label, ...rest } = props;
	const id = useId();

	return (
		<>
			<label htmlFor={`${label}-${id}-range`}>{label}</label>
			<input id={`${label}-${id}-range`} type="range" {...rest} />
		</>
	);
};
