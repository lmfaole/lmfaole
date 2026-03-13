"use client";

import React, {useMemo, useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import {NavLink} from "@fremtind/jokul/nav-link";
import {Search} from "@fremtind/jokul/search";
import {Chip} from "@fremtind/jokul/chip";
import {Select} from "@fremtind/jokul/select";
import {componentDocs} from "@/lib/componentDocs";
import {Grid} from "@/components/Grid";
import {ComponentCard} from "@/components/ComponentCard";

const ALL_CATEGORIES = Array.from(new Set(componentDocs.map((d) => d.category))).sort();
const ALL_TAGS = Array.from(new Set(componentDocs.flatMap((d) => d.tags))).sort();

export default function ComponentsPage() {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState("az");

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        const results = componentDocs.filter((doc) => {
            const matchesQuery =
                !q ||
                doc.name.toLowerCase().includes(q) ||
                doc.description.toLowerCase().includes(q) ||
                doc.package.toLowerCase().includes(q) ||
                doc.tags.some(t => t.includes(q)) ||
                doc.examples.some(
                    (ex) =>
                        ex.title.toLowerCase().includes(q) ||
                        (ex.description ?? "").toLowerCase().includes(q) ||
                        ex.tags?.some(t => t.includes(q))
                );
            const matchesCategory = !activeCategory || doc.category === activeCategory;
            const matchesTag = !activeTag || doc.tags.includes(activeTag);
            return matchesQuery && matchesCategory && matchesTag;
        });
        return results.sort((a, b) => {
            if (sortBy === "za") return b.name.localeCompare(a.name, "nb");
            if (sortBy === "most-props") return b.props.length - a.props.length;
            if (sortBy === "most-examples") return b.examples.length - a.examples.length;
            return a.name.localeCompare(b.name, "nb"); // az
        });
    }, [query, activeCategory, activeTag, sortBy]);


    return (
        <Flex as="main" direction="column" gap="xl">
            <NavLink href="/" back>Tilbake til forsiden</NavLink>
            <Flex direction="column" gap="s">
                <h1>Komponentdokumentasjon</h1>
                <p>
                    Detaljert API-dokumentasjon, prop-tabeller og levende eksempler for
                    komponenter fra Jøkul. Bruk dette som referanse når du bygger med designsystemet.
                </p>
            </Flex>

            <Flex direction="column" gap="m">
                <Flex gap="m" alignItems="end" wrap="wrap">
                    <Search
                        label="Søk etter komponent"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Navn, beskrivelse eller pakke…"
                    />
                    <Select
                        label="Sorter"
                        name="sort-components"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        items={[
                            {value: "az", label: "A–Å"},
                            {value: "za", label: "Å–A"},
                            {value: "most-props", label: "Flest props"},
                            {value: "most-examples", label: "Flest eksempler"},
                        ]}
                    />
                </Flex>
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
                <Flex gap="xs" wrap="wrap" alignItems="center">
                    <span className="muted" style={{fontSize: "0.875rem"}}>Tags:</span>
                    {ALL_TAGS.map((tag) => (
                        <Chip
                            key={tag}
                            variant="filter"
                            selected={activeTag === tag}
                            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        >
                            {tag}
                        </Chip>
                    ))}
                </Flex>
            </Flex>

            {filtered.length === 0 ? (
                <p className="muted">Ingen komponenter samsvarer med søket.</p>
            ) : (
                <Grid>
                    {filtered.map((doc) => (
                        <ComponentCard key={doc.id} doc={doc}/>
                    ))}
                </Grid>
            )}
        </Flex>
    );
}
