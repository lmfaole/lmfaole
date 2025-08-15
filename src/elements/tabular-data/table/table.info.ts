import type { ElementInfoType } from "../../element.info.type.ts";
import { SimpleTable } from "./table.example.tsx";

export const tableInfo: ElementInfoType = {
	name: "Table",
	description:
		"The table element represents data with more than one dimension, in the form of a table.\n" +
		"\n" +
		"The table element takes part in the table model. Tables have rows, columns, and cells given by their descendants. The rows and columns form a grid; a table's cells must completely cover that grid without overlap.",
	spec: "https://html.spec.whatwg.org/#the-table-element",
	category: "tabulær data",
	aliases: ["tabell"],
	examples: [SimpleTable()],
};
