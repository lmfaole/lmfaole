import {Tag} from "@fremtind/jokul/tag";
import {CodeBlock} from "@/shared/components/CodeBlock";
import type {ComponentExample} from "@/features/component-docs/docs/types";
import "./migration-example.scss";

interface MigrationExampleProps {
    example: ComponentExample & { migration: NonNullable<ComponentExample["migration"]> };
}

export function MigrationExample({example}: MigrationExampleProps) {
    const {migration} = example;
    return (
        <div className="migration-example">
            <header className="migration-example__header">
                <h3>{example.title}</h3>
                <Tag variant="warning">Utfaset</Tag>
            </header>

            {example.description && <p className="small muted">{example.description}</p>}

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
                    <CodeBlock code={example.code}/>
                </li>
            </ol>
        </div>
    );
}
