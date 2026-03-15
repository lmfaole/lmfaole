"use client";

import {useMemo, useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import {Card} from "@fremtind/jokul/card";
import {Search} from "@fremtind/jokul/search";
import {BETA_Select as Select} from "@fremtind/jokul/select";
import {NavTab, NavTabs} from "@fremtind/jokul/tabs";
import {SkeletonAnimation, SkeletonElement} from "@fremtind/jokul/loader";
import {componentDocs} from "@/app/jokul/_component-docs/data";
import {Grid} from "@/shared/components/Grid";
import {Toolbar} from "@/shared/components/Toolbar";
import {ComponentCard} from "@/shared/components/ComponentCard";
import {PageHeader} from "@/shared/components/PageHeader";
import {useLocalStorage} from "@/shared/hooks/useLocalStorage";
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
                doc.package.toLowerCase().includes(q);
            const matchesCategory = !activeCategory || doc.category === activeCategory;
            return matchesQuery && matchesCategory;
        });
        return results.sort((a, b) => {
            if (sortBy === "za") return b.name.localeCompare(a.name, "nb");
            if (sortBy === "most-props") return b.props.length - a.props.length;
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

            <div>
            <NavTabs aria-label="Vis">
                <NavTab href="/jokul/component" aria-selected>Komponenter</NavTab>
                <NavTab href="/jokul/component/props">Props-oversikt</NavTab>
            </NavTabs>
            <Card padding="l">
            <Toolbar>
                <Search
                    label="Søk etter komponent"
                    labelProps={{ srOnly: false }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Navn, beskrivelse eller pakke…"
                />
                <Select
                    label="Kategori"
                    name="filter-category"
                    value={activeCategory ?? ""}
                    onChange={(e) => setActiveCategory(e.target.value || null)}
                >
                    <option value="">Alle kategorier</option>
                    {ALL_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </Select>
                <Select
                    label="Sorter"
                    name="sort-components"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="az">A–Å</option>
                    <option value="za">Å–A</option>
                    <option value="most-props">Flest props</option>
                </Select>
            </Toolbar>

            {filtered.length === 0 ? (
                <p className="muted">Ingen komponenter samsvarer med søket.</p>
            ) : (
                <Grid columns={4}>
                    {filtered.map((doc) => (
                        <ComponentCard key={doc.id} doc={doc} />
                    ))}
                </Grid>
            )}
            </Card>
            </div>
        </Flex>
    );
}
