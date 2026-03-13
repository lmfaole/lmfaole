import React from "react";
import {Tag} from "@fremtind/jokul/tag";
import {CodeBlock} from "@/components/CodeBlock";
import type {ComponentExample} from "@/lib/docs/types";
import "./migration-example.scss";

interface MigrationExampleProps {
    example: ComponentExample & { migrationBefore: string };
}

export function MigrationExample({example}: MigrationExampleProps) {
    return (
        <div className="migration-example">
            <header className="migration-example__header">
                <h3>{example.title}</h3>
                <Tag variant="warning">Utfaset</Tag>
            </header>

            {example.description && <p className="small muted">{example.description}</p>}

            <ol className="migration-example__steps">
                <li className="migration-example__step">
                    <span className="migration-example__step-label">Finn denne koden</span>
                    <CodeBlock code={example.migrationBefore} hideCopyButton/>
                </li>

                {example.migrationSteps && example.migrationSteps.map((step, i) => (
                    <li key={i} className="migration-example__step migration-example__step--instruction">
                        <span className="migration-example__step-label muted">{step}</span>
                    </li>
                ))}

                <li className="migration-example__step">
                    <span className="migration-example__step-label">Erstatt med dette</span>
                    <CodeBlock code={example.code}/>
                </li>
            </ol>
        </div>
    );
}
