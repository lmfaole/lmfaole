import type { ReactNode } from "react";

export type CodeType = {
	children: ReactNode;
	language?: "tsx" | "html";
};
