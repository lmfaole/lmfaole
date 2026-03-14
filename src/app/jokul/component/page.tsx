"use client";

import React, {useMemo, useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import {NavLink} from "@fremtind/jokul/nav-link";
import {Search} from "@fremtind/jokul/search";
import {Chip} from "@fremtind/jokul/chip";
import {Tag} from "@fremtind/jokul/tag";
import {BETA_Select as Select} from "@fremtind/jokul/select";
import {SegmentedControl, SegmentedControlButton} from "@fremtind/jokul/segmented-control";
import {DescriptionDetail, DescriptionList, DescriptionTerm} from "@fremtind/jokul/description-list";
import {Link} from "@fremtind/jokul/link";
import type {PropSource, PropStatus} from "@/features/component-docs/data";
import {componentDocs} from "@/features/component-docs/data";
import {Grid} from "@/shared/components/Grid";
import {ComponentCard} from "@/shared/components/ComponentCard";
import {SkeletonAnimation, SkeletonElement} from "@fremtind/jokul/loader";
import {useLocalStorage} from "@/shared/hooks/useLocalStorage";
import {ChipFilterList} from "@/features/component-docs/components/ChipFilterList";
import "./component-index.scss";

const ALL_CATEGORIES = Array.from(new Set(componentDocs.map((d) => d.category))).sort();

type PropEntry = { propName: string; source: PropSource; usedBy: { id: string; name: string; status: PropStatus }[] };

const ALL_PROP_ENTRIES: PropEntry[] = (() => {
    const map = new Map<string, { source: PropSource; usedBy: { id: string; name: string; status: PropStatus }[] }>();
    for (const doc of componentDocs) {
        for (const prop of doc.props) {
            const existing = map.get(prop.name) ?? {source: prop.source, usedBy: []};
            if (!existing.usedBy.find((e) => e.id === doc.id)) {
                existing.usedBy.push({id: doc.id, name: doc.name, status: prop.status});
            }
            // if any doc marks it as custom, treat it as custom
            if (prop.source === "custom") existing.source = "custom";
            else if (prop.source === "native" && existing.source == null) existing.source = "native";
            map.set(prop.name, existing);
        }
    }
    return Array.from(map.entries())
        .map(([propName, {source, usedBy}]) => ({propName, source, usedBy}))
        .sort((a, b) => a.propName.localeCompare(b.propName, "nb"));
})();

export default function ComponentsPage() {
    const [view, setView, viewReady] = useLocalStorage<"components" | "props">("comp-view", "components");
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useLocalStorage("comp-sort", "az");
    const [propQuery, setPropQuery] = useState("");
    const [propSortBy, setPropSortBy] = useLocalStorage("comp-prop-sort", "az");
    const [propSourceFilter, setPropSourceFilter] = useState<PropSource | null>(null);
    const [propStatusFilter, setPropStatusFilter] = useState<PropStatus | null>(null);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        const results = componentDocs.filter((doc) => {
            const matchesQuery =
                !q ||
                doc.name.toLowerCase().includes(q) ||
                doc.description.toLowerCase().includes(q) ||
                doc.package.toLowerCase().includes(q) ||
                doc.examples.some(
                    (ex) =>
                        ex.title.toLowerCase().includes(q) ||
                        (ex.description ?? "").toLowerCase().includes(q) ||
                        ex.tags?.some(t => t.includes(q))
                );
            const matchesCategory = !activeCategory || doc.category === activeCategory;
            return matchesQuery && matchesCategory;
        });
        return results.sort((a, b) => {
            if (sortBy === "za") return b.name.localeCompare(a.name, "nb");
            if (sortBy === "most-props") return b.props.length - a.props.length;
            if (sortBy === "most-examples") return b.examples.length - a.examples.length;
            return a.name.localeCompare(b.name, "nb");
        });
    }, [query, activeCategory, sortBy]);

    const filteredProps = useMemo(() => {
        const q = propQuery.toLowerCase().trim();
        const results = ALL_PROP_ENTRIES.filter(
            (e) =>
                (!q || e.propName.toLowerCase().includes(q) || e.usedBy.some((c) => c.name.toLowerCase().includes(q))) &&
                (!propSourceFilter || e.source === propSourceFilter) &&
                (!propStatusFilter || e.usedBy.some((c) => c.status === propStatusFilter)),
        );
        if (propSortBy === "za") return results.sort((a, b) => b.propName.localeCompare(a.propName, "nb"));
        if (propSortBy === "most-used") return results.sort((a, b) => b.usedBy.length - a.usedBy.length);
        if (propSortBy === "least-used") return results.sort((a, b) => a.usedBy.length - b.usedBy.length);
        return results.sort((a, b) => a.propName.localeCompare(b.propName, "nb"));
    }, [propQuery, propSortBy, propSourceFilter, propStatusFilter]);

    if (!viewReady) {
        return (
            <Flex as="main" direction="column" gap="xl">                <Flex direction="column" gap="s">
                    <h1>Komponentdokumentasjon</h1>
                    <p>
                        Detaljert API-dokumentasjon, prop-tabeller og levende eksempler for
                        komponenter fra Jøkul. Bruk dette som referanse når du bygger med designsystemet.
                    </p>
                </Flex>
                <SkeletonAnimation textDescription="Laster innstillinger…">
                    <SkeletonElement width="20rem" height="2.5rem" />
                    <SkeletonElement width="100%" height="12rem" className="component-index__skeleton-gap" />
                </SkeletonAnimation>
            </Flex>
        );
    }

    return (
        <Flex as="main" direction="column" gap="xl">            <Flex direction="column" gap="s">
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
                            >
                                <option value="az">A–Å</option>
                                <option value="za">Å–A</option>
                                <option value="most-props">Flest props</option>
                                <option value="most-examples">Flest eksempler</option>
                            </Select>
                        </Flex>
                        <ChipFilterList items={ALL_CATEGORIES} selected={activeCategory} onChange={setActiveCategory} />
                    </Flex>

                    {filtered.length === 0 ? (
                        <p className="muted">Ingen komponenter samsvarer med søket.</p>
                    ) : (
                        <Grid columns={4}>
                            {filtered.map((doc) => (
                                <ComponentCard key={doc.id} doc={doc}/>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            {view === "props" && (
                <Flex direction="column" gap="m">
                    <Flex gap="m" alignItems="end" wrap="wrap">
                        <Search
                            label="Filtrer props"
                            value={propQuery}
                            onChange={(e) => setPropQuery(e.target.value)}
                            placeholder="Propnavn eller komponentnavn…"
                        />
                        <Select
                            label="Sorter"
                            name="sort-props"
                            value={propSortBy}
                            onChange={(e) => setPropSortBy(e.target.value)}
                        >
                            <option value="az">A–Å</option>
                            <option value="za">Å–A</option>
                            <option value="most-used">Mest brukt</option>
                            <option value="least-used">Minst brukt</option>
                        </Select>
                    </Flex>
                    <Flex as="ul" className="chip-list" gap="xs" wrap="wrap">
                        {(["custom", "native", "react", "aria"] as PropSource[]).map((src) => {
                            const label = src === "custom" ? "Egendefinert" : src === "native" ? "Native HTML" : src === "react" ? "React" : "ARIA";
                            return (
                                <li key={src}>
                                    <Chip
                                        variant="filter"
                                        selected={propSourceFilter === src}
                                        onClick={() => setPropSourceFilter(propSourceFilter === src ? null : src)}
                                    >
                                        {label}
                                    </Chip>
                                </li>
                            );
                        })}
                    </Flex>
                    <Flex as="ul" className="chip-list" gap="xs" wrap="wrap">
                        {(["stable", "deprecated", "experimental"] as PropStatus[]).map((s) => {
                            const label = s === "stable" ? "Stabil" : s === "deprecated" ? "Utfaset" : "Eksperimentell";
                            return (
                                <li key={s}>
                                    <Chip
                                        variant="filter"
                                        selected={propStatusFilter === s}
                                        onClick={() => setPropStatusFilter(propStatusFilter === s ? null : s)}
                                    >
                                        {label}
                                    </Chip>
                                </li>
                            );
                        })}
                    </Flex>
                    <p className="muted component-index__count">
                        {filteredProps.length} av {ALL_PROP_ENTRIES.length} props
                    </p>
                    <DescriptionList alignment="horizontal" separators>
                        {filteredProps.map((entry) => (
                            <React.Fragment key={entry.propName}>
                                <DescriptionTerm>
                                    <Flex direction="column" gap="xs">
                                        <code>{entry.propName} {!propSourceFilter && `(${entry.source})`}</code>
                                    </Flex>
                                </DescriptionTerm>
                                {entry.usedBy
                                    .filter((comp) => !propStatusFilter || comp.status === propStatusFilter)
                                    .map((comp) => (
                                        <DescriptionDetail key={comp.id}>
                                            <Flex gap="xs" alignItems="center">
                                                <Link href={`/jokul/component/${comp.id}`}>{comp.name}</Link>
                                                {comp.status !== "stable" && (
                                                    <Tag variant={comp.status === "deprecated" ? "warning" : "info"}>
                                                        {comp.status === "deprecated" ? "Utfaset" : "Eksperimentell"}
                                                    </Tag>
                                                )}
                                            </Flex>
                                        </DescriptionDetail>
                                    ))}
                            </React.Fragment>
                        ))}
                    </DescriptionList>
                </Flex>
            )}
        </Flex>
    );
}


