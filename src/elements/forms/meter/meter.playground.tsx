import { useState } from "react";
import { Playground } from "../../../patterns/playground/playground.tsx";
import { Number as NumberInput } from "../number/number.tsx";
import { Range } from "../range/range.tsx";
import { Text } from "../text/text.tsx";
import { Meter } from "./meter.tsx";

export const MeterPlayground = () => {
	const minValue = 0;
	const maxValue = 100;
	const lowValue = 25;
	const highValue = 85;
	const optimumValue = 80;

	const [value, setValue] = useState(50);
	const [max, setMax] = useState(maxValue);
	const [min, setMin] = useState(minValue);
	const [low, setLow] = useState(lowValue);
	const [high, setHigh] = useState(highValue);
	const [optimum, setOptimum] = useState(optimumValue);
	const [suffix, setSuffix] = useState(" liter");
	const [label, setLabel] = useState("Drivstoff");

	return (
		<Playground
			requiredProps={[
				<Text
					label={"Label"}
					defaultValue={label}
					placeholder={"Drivstoff"}
					value={label}
					onChange={(e) => setLabel(e.target.value)}
				/>,
				<NumberInput
					label={"Max"}
					step={5}
					defaultValue={max}
					max={maxValue}
					min={min}
					onChange={(e) => setMax(Number(e.target.value))}
				/>,
				<Range
					label={"Verdi"}
					value={value}
					max={max}
					min={min}
					onChange={(e) => setValue(Number(e.target.value))}
				/>,
			]}
			optionalProps={[
				<Text
					label={"Suffix"}
					defaultValue={suffix}
					placeholder={" liter"}
					value={suffix}
					onChange={(e) => setSuffix(e.target.value)}
				/>,
				<NumberInput
					label={"Min"}
					step={5}
					defaultValue={min}
					value={min}
					max={max}
					onChange={(e) => setMin(Number(e.target.value))}
				/>,
				<Range
					label={"Optimal"}
					step={5}
					defaultValue={optimum}
					value={optimum}
					max={max - 1}
					min={min + 1}
					onChange={(e) => setOptimum(Number(e.target.value))}
				/>,
				<Range
					label={"Lav"}
					defaultValue={low}
					value={low}
					max={high - 1}
					min={minValue}
					onChange={(e) => setLow(Number(e.target.value))}
				/>,
				<Range
					label={"Høy"}
					defaultValue={high}
					max={maxValue}
					min={low + 1}
					value={high}
					onChange={(e) => setHigh(Number(e.target.value))}
				/>,
			]}
		>
			<Meter
				max={max}
				value={value}
				min={min}
				optimum={optimum}
				low={low}
				high={high}
				suffix={suffix}
				label={label}
			/>
		</Playground>
	);
};
