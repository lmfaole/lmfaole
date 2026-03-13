"use client";

import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Link } from "@fremtind/jokul/link";
import { useParams } from "next/navigation";
import { getComponentDoc, getRelatedDocs } from "@/lib/componentDocs";
import { ComponentCard } from "@/components/ComponentCard";
import { Grid } from "@/components/Grid";

export default function ComponentLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const id = params.id as string;
    const doc = getComponentDoc(id);
    const related = getRelatedDocs(id);

    return (
        <Flex direction="column" gap="xl">
            <NavLink href="/component" back>Tilbake til alle komponenter</NavLink>
            {children}
            {related.length > 0 && (
                <Flex direction="column" gap="s">
                    <h2>Relaterte komponenter</h2>
                    <Grid>
                        {related.map((rel) => (
                            <ComponentCard key={rel.id} doc={rel} />
                        ))}
                    </Grid>
                </Flex>
            )}
            {doc && (
                <Flex as="footer" direction="column" gap="xs">
                    <p className="muted">
                        Importér fra{" "}
                        <code>{doc.package}</code>
                    </p>
                    <p className="muted">
                        <Link href="https://jokul.fremtind.no/" external>
                            Se offisiell Jøkul-dokumentasjon
                        </Link>
                    </p>
                </Flex>
            )}
        </Flex>
    );
}
