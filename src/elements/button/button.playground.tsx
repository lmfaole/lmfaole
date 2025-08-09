import { useState } from "react";
import { Playground } from "../../patterns/playground/playground.tsx";
import { Checkbox } from "../inputs/checkbox/checkbox.tsx";
import { Text } from "../inputs/text/text.tsx";
import { Select } from "../select/select.tsx";
import { Button } from "./button.tsx";
import type { ButtonType } from "./button.type.ts";

export const ButtonPlayground = () => {
	const buttonTypes = ["button", "submit", "reset"];

	const [label, setLabel] = useState("Knapp");
	const [title, setTitle] = useState(label);
	const [disabled, setDisabled] = useState(false);
	const [type, setType] = useState("" as ButtonType["type"]);

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
			]}
			optionalProps={[
				<Text
					label={"Title"}
					defaultValue={title}
					placeholder={label}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
				/>,
				<Checkbox
					label={"Disabled"}
					checked={disabled}
					onChange={(e) => setDisabled(e.target.checked)}
				/>,
				<Select
					label={"Type"}
					value={type}
					onChange={(e) => setType(e.target.value as ButtonType["type"])}
				>
					{buttonTypes.map((type) => (
						<option>{type}</option>
					))}
					<option label={"Ikke satt"} value={undefined} />
				</Select>,
			]}
		>
			<Button title={title} disabled={disabled} type={type}>
				{label}
			</Button>
		</Playground>
	);
};
