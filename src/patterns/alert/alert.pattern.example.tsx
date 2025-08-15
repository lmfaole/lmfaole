import { useState } from "react";
import { Alert } from "../../components/alert/alert.tsx";
import { Button } from "../../elements";

export const AlertPatternExample = () => {
	const [showAlert, setShowAlert] = useState<boolean>(false);

	return (
		<>
			<Button
				aria-pressed={showAlert}
				onClick={(_) => setShowAlert(!showAlert)}
			>
				Veksle visning av melding
			</Button>
			{showAlert && (
				<Alert message={"Feilmelding velykket!"} type={"success"} />
			)}
		</>
	);
};
