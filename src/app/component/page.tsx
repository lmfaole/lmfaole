"use client";

import React, {useMemo, useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import {NavLink} from "@fremtind/jokul/nav-link";
import {Search} from "@fremtind/jokul/search";
import {Chip} from "@fremtind/jokul/chip";
import {Select} from "@fremtind/jokul/select";
import {SegmentedControl, SegmentedControlButton} from "@fremtind/jokul/segmented-control";
import {DescriptionList, DescriptionTerm, DescriptionDetail} from "@fremtind/jokul/description-list";
import {Link} from "@fremtind/jokul/link";
import {componentDocs} from "@/lib/componentDocs";
import {Grid} from "@/components/Grid";
import {ComponentCard} from "@/components/ComponentCard";

const ALL_CATEGORIES = Array.from(new Set(componentDocs.map((d) => d.category))).sort();
const ALL_TAGS = Array.from(new Set(componentDocs.flatMap((d) => d.tags))).sort();

type PropEntry = { propName: string; usedBy: { id: string; name: string }[] };

const ALL_PROP_ENTRIES: PropEntry[] = (() => {
    const map = new Map<string, { id: string; name: string }[]>();
    for (const doc of componentDocs) {
        for (const prop of doc.props) {
            const existing = map.get(prop.name) ?? [];
            if (!existing.find((e) => e.id === doc.id)) existing.push({ id: doc.id, name: doc.name });
            map.set(prop.name, existing);
        }
    }
    return Array.from(map.entries())
        .map(([propName, usedBy]) => ({ propName, usedBy }))
        .sort((a, b) => a.propName.localeCompare(b.propName, "nb"));
})();

export default function ComponentsPage() {
    const [view, setView] = useState<"components" | "props">("components");
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState("az");
    const [propQuery, setPropQuery] = useState("");

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
            return a.name.localeCompare(b.name, "nb");
        });
    }, [query, activeCategory, activeTag, sortBy]);

    const filteredProps = useMemo(() => {
        const q = propQuery.toLowerCase().trim();
        if (!q) return ALL_PROP_ENTRIES;
        return ALL_PROP_ENTRIES.filter(
            (e) =>
                e.propName.toLowerCase().includes(q) ||
                e.usedBy.some((c) => c.name.toLowerCase().includes(q)),
        );
    }, [propQuery]);

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

            <SegmentedControl legend="Vis">
                <SegmentedControlButton
                    value="components"
                    checked={view === "components"}
                    onChange={() => setView("components")}
                >
                    Komponenter
                </SegmentedControlButton>
                <SegmentedControlButton
                    value="props"
                    checked={view === "props"}
                    onChange={() => setView("props")}
                >
                    Prop-indeks
                </SegmentedControlButton>
            </SegmentedControl>

            {view === "components" && (
                <>
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
                </>
            )}

            {view === "props" && (
                <Flex direction="column" gap="m">
                    <Search
                        label="Filtrer props"
                        value={propQuery}
                        onChange={(e) => setPropQuery(e.target.value)}
                        placeholder="Propnavn eller komponentnavn…"
                    />
                    <p className="muted" style={{margin: 0, fontSize: "var(--jkl-font-size-s)"}}>
                        {filteredProps.length} av {ALL_PROP_ENTRIES.length} props
                    </p>
                    <DescriptionList alignment="horizontal" separators>
                        {filteredProps.map((entry) => (
                            <React.Fragment key={entry.propName}>
                                <DescriptionTerm><code>{entry.propName}</code></DescriptionTerm>
                                <DescriptionDetail>
                                    <Flex wrap="wrap" gap="xs">
                                        {entry.usedBy.map((comp) => (
                                            <Link key={comp.id} href={`/component/${comp.id}`}>{comp.name}</Link>
                                        ))}
                                    </Flex>
                                </DescriptionDetail>
                            </React.Fragment>
                        ))}
                    </DescriptionList>
                </Flex>
            )}
        </Flex>
    );
}


