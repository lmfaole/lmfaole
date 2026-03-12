"use client";

import React, { useMemo, useState } from "react";
import { Flex } from "@fremtind/jokul/flex";
import { Card } from "@fremtind/jokul/card";
import { Link } from "@fremtind/jokul/link";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Search } from "@fremtind/jokul/search";
import { Chip } from "@fremtind/jokul/chip";
import { componentDocs } from "@/lib/componentDocs";
import { Grid } from "@/components/Grid";

const ALL_CATEGORIES = Array.from(new Set(componentDocs.map((d) => d.category))).sort();

export default function ComponentsPage() {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return componentDocs.filter((doc) => {
            const matchesQuery =
                !q ||
                doc.name.toLowerCase().includes(q) ||
                doc.description.toLowerCase().includes(q) ||
                doc.package.toLowerCase().includes(q) ||
                doc.examples.some(
                    (ex) =>
                        ex.title.toLowerCase().includes(q) ||
                        (ex.description ?? "").toLowerCase().includes(q)
                );
            const matchesCategory = !activeCategory || doc.category === activeCategory;
            return matchesQuery && matchesCategory;
        });
    }, [query, activeCategory]);

    const grouped = useMemo(() => {
        const map = new Map<string, typeof filtered>();
        for (const doc of filtered) {
            if (!map.has(doc.category)) map.set(doc.category, []);
            map.get(doc.category)!.push(doc);
        }
        return Array.from(map.entries());
    }, [filtered]);

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

            <Flex direction="column" gap="m">
                <Search
                    label="Søk etter komponent"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Navn, beskrivelse eller pakke…"
                />
                <Flex gap="xs" wrap="wrap">
                    {ALL_CATEGORIES.map((cat) => (
                        <Chip
                            key={cat}
                            variant="filter"
                            selected={activeCategory === cat}
                            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                        >
                            {cat}
                        </Chip>
                    ))}
                </Flex>
            </Flex>

            {filtered.length === 0 ? (
                <p className="muted">Ingen komponenter samsvarer med søket.</p>
            ) : (
                <Flex direction="column" gap="xl">
                    {grouped.map(([cat, docs]) => (
                        <Flex key={cat} direction="column" gap="l">
                            <h2>{cat}</h2>
                            <Grid>
                                {docs.map((doc) => (
                                    <Card key={doc.id} padding="l">
                                        <Flex direction="column" gap="s">
                                            <h3>
                                                <Link href={`/component/${doc.id}`}>{doc.name}</Link>
                                            </h3>
                                            <p>{doc.description.split(".")[0]}.</p>
                                            <small className="muted">{doc.examples.map((ex) => ex.title).join(", ")}</small>
                                            <p className="muted">{doc.props.length} props · {doc.examples.length} eksempler</p>
                                        </Flex>
                                    </Card>
                                ))}
                            </Grid>
                        </Flex>
                    ))}
                </Flex>
            )}
        </Flex>
    );
}
