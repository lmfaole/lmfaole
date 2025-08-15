import type { AlertType } from "./alert.type.ts";
import "./alert.css";

export const Alert = ({ message, type }: AlertType) => {
	return (
		<div className="alert" role={"alert"} data-type={type}>
			{message}
		</div>
	);
};
