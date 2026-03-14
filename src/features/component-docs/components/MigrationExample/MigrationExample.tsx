import {Tag} from "@fremtind/jokul/tag";
import {CodeBlock} from "@/shared/components/CodeBlock";
import type {Migration} from "@/features/component-docs/docs/types";
import "./migration-example.scss";

interface MigrationExampleProps {
    migration: Migration;
}

export function MigrationExample({migration}: MigrationExampleProps) {
    return (
        <div className="migration-example">
            <header className="migration-example__header">
                <h3>{migration.title}</h3>
                <Tag variant="warning">Utfaset</Tag>
            </header>

            {migration.description && <p className="small muted">{migration.description}</p>}

            <div className="migration-example__props">
                <span className="migration-example__props-label muted">Utfases:</span>
                {migration.deprecates.map((item) => (
                    <span key={item.name} className="migration-example__props-item">
                        <code>{item.name}</code>
                        <span className={`migration-example__props-kind migration-example__props-kind--${item.kind}`}>
                            {item.kind === "component" ? "komponent" : "prop"}
                        </span>
                    </span>
                ))}
                {migration.replacedBy && <>
                    <span className="migration-example__props-arrow" aria-hidden>→</span>
                    <span className="migration-example__props-label muted">Erstattes av:</span>
                    {migration.replacedBy.map((item) => (
                        <span key={item.name} className="migration-example__props-item">
                            <code>{item.name}</code>
                            <span className={`migration-example__props-kind migration-example__props-kind--${item.kind}`}>
                                {item.kind === "component" ? "komponent" : "prop"}
                            </span>
                        </span>
                    ))}
                </>}
            </div>

            <ol className="migration-example__steps">
                <li className="migration-example__step">
                    <span className="migration-example__step-label">Finn denne koden</span>
                    <CodeBlock code={migration.before} hideCopyButton/>
                </li>
                <li className="migration-example__step">
                    <span className="migration-example__step-label">Erstatt med dette</span>
                    <CodeBlock code={migration.after}/>
                </li>
            </ol>

            {migration.preview && (
                <div className="migration-example__preview">
                    {migration.preview}
                </div>
            )}
        </div>
    );
}
