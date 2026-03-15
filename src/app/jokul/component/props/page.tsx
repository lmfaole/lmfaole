"use client";

import React, {useMemo, useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import {Search} from "@fremtind/jokul/search";
import {BETA_Select as Select} from "@fremtind/jokul/select";
import {NavTab, NavTabs} from "@fremtind/jokul/tabs";
import {SkeletonAnimation, SkeletonElement} from "@fremtind/jokul/loader";
import {DataTable} from "@fremtind/jokul/table";
import {Tag} from "@fremtind/jokul/tag";
import {Link} from "@fremtind/jokul/link";
import type {PropSource, PropStatus} from "@/features/component-docs/data";
import {ALL_PROP_ENTRIES} from "@/features/component-docs/prop-index";
import {PageHeader} from "@/shared/components/PageHeader";
import {useLocalStorage} from "@/shared/hooks/useLocalStorage";
import "../component-index.scss";

const SOURCE_LABEL: Record<PropSource, string> = {
    custom: "Egendefinert",
    native: "Native HTML",
    aria: "ARIA",
    react: "React",
};

const STATUS_LABEL: Record<PropStatus, string> = {
    stable: "—",
    deprecated: "Utfaset",
    experimental: "Eksperimentell",
};

const COLUMNS = ["Prop", "Kilde", "Status", "Brukt i"];

export default function PropIndexPage() {
    const [propQuery, setPropQuery] = useState("");
    const [propSortBy, setPropSortBy, ready] = useLocalStorage("comp-prop-sort", "az");

    const filteredProps = useMemo(() => {
        const q = propQuery.toLowerCase().trim();
        const results = ALL_PROP_ENTRIES.filter(
            (e) => !q || e.propName.toLowerCase().includes(q) || e.usedBy.some((c) => c.name.toLowerCase().includes(q))
        );
        if (propSortBy === "za") return results.sort((a, b) => b.propName.localeCompare(a.propName, "nb"));
        if (propSortBy === "most-used") return results.sort((a, b) => b.usedBy.length - a.usedBy.length);
        if (propSortBy === "least-used") return results.sort((a, b) => a.usedBy.length - b.usedBy.length);
        return results.sort((a, b) => a.propName.localeCompare(b.propName, "nb"));
    }, [propQuery, propSortBy]);

    const rows = useMemo(() =>
        filteredProps.map((entry) => [
            <code key="name">{entry.propName}</code>,
            <span key="source">{SOURCE_LABEL[entry.source]}</span>,
            entry.status !== "stable" ? (
                <Tag key="status" variant={entry.status === "deprecated" ? "warning" : "info"}>
                    {STATUS_LABEL[entry.status]}
                </Tag>
            ) : (
                <span key="status" style={{color: "var(--jkl-color-text-subdued)"}}>—</span>
            ),
            <Flex key="usedBy" gap="2xs" wrap="wrap">
                {entry.usedBy.map((comp, i) => (
                    <React.Fragment key={comp.id}>
                        <Link href={`/jokul/component/${comp.id}`}>{comp.name}</Link>
                        {i < entry.usedBy.length - 1 && <span style={{color: "var(--jkl-color-text-subdued)"}}>,</span>}
                    </React.Fragment>
                ))}
            </Flex>,
        ]),
    [filteredProps]);

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
                <NavTab href="/jokul/component">Komponenter</NavTab>
                <NavTab href="/jokul/component/props" aria-selected>Prop-indeks</NavTab>
            </NavTabs>

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
                <p className="muted component-index__count">
                    {filteredProps.length} av {ALL_PROP_ENTRIES.length} props
                </p>
                <DataTable
                    caption="Prop-indeks"
                    columns={COLUMNS}
                    rows={rows}
                    collapseToList
                />
            </Flex>
        </Flex>
    );
}
