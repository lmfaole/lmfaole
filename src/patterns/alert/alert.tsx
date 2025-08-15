import type { AlertType } from "./alert.type.ts";

export const Alert = ({ message }: AlertType) => {
	return (
		<div className="alert" role={"alert"}>
			{message}
		</div>
	);
};
