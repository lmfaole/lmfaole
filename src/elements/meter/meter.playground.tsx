import { useState } from "react";
import { Playground } from "../../patterns/playground/playground.tsx";
import { Number as NumberInput } from "../inputs/number/number.tsx";
import { Range } from "../inputs/range/range.tsx";
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

	return (
		<Playground
			controls={
				<>
					<Range
						label={"Verdi"}
						value={value}
						max={max}
						min={min}
						onChange={(e) => setValue(Number(e.target.value))}
					/>
					<NumberInput
						label={"Max"}
						step={5}
						defaultValue={max}
						max={maxValue}
						min={min}
						onChange={(e) => setMax(Number(e.target.value))}
					/>

					<NumberInput
						label={"Optimal"}
						step={5}
						defaultValue={optimum}
						max={max}
						min={min}
						onChange={(e) => setOptimum(Number(e.target.value))}
					/>

					<NumberInput
						label={"Min"}
						step={5}
						defaultValue={min}
						max={max}
						min={minValue}
						onChange={(e) => setMin(Number(e.target.value))}
					/>

					<NumberInput
						label={"Lav"}
						defaultValue={low}
						max={high}
						min={min}
						onChange={(e) => setLow(Number(e.target.value))}
					/>

					<NumberInput
						label={"Høy"}
						defaultValue={high}
						max={max}
						min={low}
						onChange={(e) => setHigh(Number(e.target.value))}
					/>
				</>
			}
		>
			<Meter
				max={max}
				value={value}
				min={min}
				optimum={optimum}
				low={low}
				high={high}
				label={"eee"}
			/>
		</Playground>
	);
};
