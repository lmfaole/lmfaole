import React from "react";
import type { PropDef } from "@/lib/componentDocs";
import "./prop-table.scss";

interface PropTableProps {
    props: PropDef[];
}

export function PropTable({ props }: PropTableProps) {
    return (
        <div className="prop-table-wrapper">
            <table className="prop-table">
                <thead>
                    <tr>
                        <th scope="col">Prop</th>
                        <th scope="col">Type</th>
                        <th scope="col">Påkrevd</th>
                        <th scope="col">Standard</th>
                        <th scope="col">Beskrivelse</th>
                    </tr>
                </thead>
                <tbody>
                    {props.map((prop) => (
                        <tr key={prop.name}>
                            <td><code>{prop.name}</code></td>
                            <td><code className="prop-table__type">{prop.type}</code></td>
                            <td className={prop.required ? "prop-table__required" : "prop-table__optional"}>
                                {prop.required ? "Ja" : "Nei"}
                            </td>
                            <td>{prop.default ? <code>{prop.default}</code> : <span className="muted">—</span>}</td>
                            <td>{prop.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
