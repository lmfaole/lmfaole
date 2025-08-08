import type { ElementInfoType } from "../../element-info.type.ts";
import type { NumberType } from "./number.type.ts";

export const Number = (props: NumberType) => {
	const { size = 10, inputMode = "numeric", suffix, ...rest } = props;

	return (
		<label>
			{props.label}
			<input
				{...rest}
				type="number"
				size={size}
				inputMode={inputMode}
				data-suffix={suffix}
			/>
		</label>
	);
};

export const numberInputInfo: ElementInfoType = {
	name: "Number",
	example: <Number label={"Skriv et tall"} />,
};
