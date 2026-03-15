"use client";

import {useMemo, useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import {Search} from "@fremtind/jokul/search";
import {BETA_Select as Select} from "@fremtind/jokul/select";
import {NavTab, NavTabs} from "@fremtind/jokul/tabs";
import {SkeletonAnimation, SkeletonElement} from "@fremtind/jokul/loader";
import {componentDocs} from "@/features/component-docs/data";
import {Grid} from "@/shared/components/Grid";
import {ComponentCard} from "@/shared/components/ComponentCard";
import {PageHeader} from "@/shared/components/PageHeader";
import {useLocalStorage} from "@/shared/hooks/useLocalStorage";
import {ChipFilterList} from "@/features/component-docs/components/ChipFilterList";
import "./component-index.scss";

const ALL_CATEGORIES = Array.from(
    new Set(componentDocs.filter((d) => d.standalone !== false).map((d) => d.category))
).sort();

export default function ComponentsPage() {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [sortBy, setSortBy, ready] = useLocalStorage("comp-sort", "az");

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        const results = componentDocs.filter((doc) => {
            if (doc.standalone === false) return false;
            const matchesQuery =
                !q ||
                doc.name.toLowerCase().includes(q) ||
                doc.description.toLowerCase().includes(q) ||
                doc.package.toLowerCase().includes(q) ||
                doc.examples.some(
                    (ex) =>
                        ex.title.toLowerCase().includes(q) ||
                        (ex.description ?? "").toLowerCase().includes(q) ||
                        ex.tags?.some((t) => t.includes(q))
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

    if (!ready) {
        return (
            <Flex as="main" direction="column" gap="xl">
                <PageHeader
                    title="Komponentdokumentasjon"
                    description="Detaljert API-dokumentasjon, prop-tabeller og levende eksempler for komponenter fra Jøkul. Bruk dette som referanse når du bygger med designsystemet."
                />
                <SkeletonAnimation textDescription="Laster innstillinger…">
                    <SkeletonElement width="20rem" height="2.5rem" />
                    <SkeletonElement width="100%" height="12rem" className="component-index__skeleton-gap" />
                </SkeletonAnimation>
            </Flex>
        );
    }

    return (
        <Flex as="main" direction="column" gap="xl">
            <PageHeader
                title="Komponentdokumentasjon"
                description="Detaljert API-dokumentasjon, prop-tabeller og levende eksempler for komponenter fra Jøkul. Bruk dette som referanse når du bygger med designsystemet."
            />

            <NavTabs aria-label="Vis">
                <NavTab href="/jokul/component" aria-selected>Komponenter</NavTab>
                <NavTab href="/jokul/component/props">Prop-indeks</NavTab>
            </NavTabs>

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
                        <ComponentCard key={doc.id} doc={doc} />
                    ))}
                </Grid>
            )}
        </Flex>
    );
}
