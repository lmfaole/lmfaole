"use client";

import React from "react";
import {Flex} from "@fremtind/jokul/flex";
import {Card} from "@fremtind/jokul/card";
import {Link} from "@fremtind/jokul/link";
import {componentDocs} from "@/lib/componentDocs";
import {Grid} from "@/components/Grid";
import {NavLink} from "@fremtind/jokul/nav-link";

const CATEGORY_VARIANT = {
    Layout: "info",
    Skjema: "success",
    Tilbakemelding: "warning",
    Navigasjon: "neutral",
    Visning: "neutral",
} as const;

export default function ComponentsPage() {
    return (
        <Flex as="main" direction="column" gap="xl">
            <NavLink href="/" back>Tilbake til forsiden</NavLink>
            <Flex direction="column" gap="s">
                <h1>Komponentdokumentasjon</h1>
                <p>
                    Detaljert API-dokumentasjon, prop-tabeller og levende eksempler for
                    komponentene i Jøkul. Bruk dette som referanse når du bygger med designsystemet.
                </p>
            </Flex>
            <Grid className="component-grid">
                {componentDocs.map((doc) => (
                    <Card key={doc.id} padding="l">
                        <Flex direction="column" gap="s">
                            <h2>
                                <Link href={`/component/${doc.id}`}>{doc.name}</Link>
                            </h2>
                            <p>{doc.description.split(".")[0]}.</p>
                            <code className="component-package">{doc.package}</code>
                            <p className="muted">{doc.props.length} props · {doc.examples.length} eksempler</p>
                        </Flex>
                    </Card>
                ))}
            </Grid>
        </Flex>
    );
}
