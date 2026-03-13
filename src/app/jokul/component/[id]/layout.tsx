"use client";

export const runtime = "edge";

import { Flex } from "@fremtind/jokul/flex";
import { Link } from "@fremtind/jokul/link";
import { useParams } from "next/navigation";
import { getComponentDoc, getRelatedDocs } from "@/lib/componentDocs";
import { ComponentCard } from "@/components/ComponentCard";
import { Grid } from "@/components/Grid";
import { CopyableCode } from "@/components/CopyableCode/CopyableCode";

export default function ComponentLayout({ children }: { children: React.ReactNode }) {
    const { id } = useParams<{ id: string }>();
    const doc = getComponentDoc(id);
    const related = getRelatedDocs(id);

    return (
        <Flex direction="column" gap="xl">
            {children}
            {related.length > 0 && (
                <>
                    <h2>Relaterte komponenter</h2>
                    <Grid columns={4}>
                        {related.map((rel) => (
                            <ComponentCard key={rel.id} doc={rel} />
                        ))}
                    </Grid>
                </>
            )}
            {doc && (
                <footer>
                    <p className="muted">
                        Importér fra{" "}
                        <CopyableCode>{doc.package}</CopyableCode>
                    </p>
                    <p className="muted">
                        <Link href="https://jokul.fremtind.no/" external>
                            Se offisiell Jøkul-dokumentasjon
                        </Link>
                    </p>
                </footer>
            )}
        </Flex>
    );
}
