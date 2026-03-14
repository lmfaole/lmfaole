import {CodeBlock} from "@/shared/components/CodeBlock";
import type {Migration} from "@/features/component-docs/docs/types";
import "./migration-example.scss";

interface MigrationExampleProps {
    migration: Migration;
}

export function MigrationExample({migration}: MigrationExampleProps) {
    return (
        <div className="migration-example">
            <h3 className="migration-example__title">
                <code>{migration.deprecates.name}</code>
                <span className="muted migration-example__kind">
                    {migration.deprecates.kind === "component" ? "komponent" : "prop"}
                </span>
            </h3>

            {migration.description && <p className="small muted">{migration.description}</p>}

            {migration.replacedBy && (
                <p className="small muted migration-example__replaced-by">
                    Erstattes av:{" "}
                    {migration.replacedBy.map((item, i) => (
                        <span key={item.name}>
                            {i > 0 && ", "}
                            <code>{item.name}</code>
                        </span>
                    ))}
                </p>
            )}

            <div className="migration-example__blocks">
                <div className="migration-example__block">
                    <span className="migration-example__block-label muted">Før</span>
                    <CodeBlock code={migration.before} hideCopyButton/>
                </div>
                <div className="migration-example__block">
                    <span className="migration-example__block-label muted">Etter</span>
                    <CodeBlock code={migration.after}/>
                </div>
            </div>
        </div>
    );
}
