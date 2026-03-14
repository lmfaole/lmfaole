import {CodeBlock} from "@/shared/components/CodeBlock";
import {Grid} from "@/shared/components/Grid";
import type {Migration} from "@/features/component-docs/docs/types";
import "./migration-example.scss";

interface MigrationExampleProps {
    migration: Migration;
}

export function MigrationExample({migration}: MigrationExampleProps) {
    return (
        <div className="migration-example">
            {migration.description && <p className="small muted">{migration.description}</p>}

            {migration.replacedBy && (
                <p className="small muted">
                    Erstattes av:{" "}
                    {migration.replacedBy.map((item, i) => (
                        <span key={item.name}>
                            {i > 0 && ", "}
                            <code>{item.name}</code>
                        </span>
                    ))}
                </p>
            )}

            <Grid columns={2} gap="m">
                <div className="migration-example__block">
                    <span className="migration-example__block-label muted">Før</span>
                    <CodeBlock code={migration.before} hideCopyButton/>
                </div>
                <div className="migration-example__block">
                    <span className="migration-example__block-label muted">Etter</span>
                    <CodeBlock code={migration.after}/>
                </div>
            </Grid>
        </div>
    );
}
