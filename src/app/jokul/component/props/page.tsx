"use client";

import React, {useMemo, useState} from "react";
import {Flex} from "@fremtind/jokul/flex";
import {Search} from "@fremtind/jokul/search";
import {Chip} from "@fremtind/jokul/chip";
import {Tag} from "@fremtind/jokul/tag";
import {BETA_Select as Select} from "@fremtind/jokul/select";
import {NavTab, NavTabs} from "@fremtind/jokul/tabs";
import {SkeletonAnimation, SkeletonElement} from "@fremtind/jokul/loader";
import {DescriptionDetail, DescriptionList, DescriptionTerm} from "@fremtind/jokul/description-list";
import {Link} from "@fremtind/jokul/link";
import type {PropSource, PropStatus} from "@/features/component-docs/data";
import {ALL_PROP_ENTRIES} from "@/features/component-docs/prop-index";
import {PageHeader} from "@/shared/components/PageHeader";
import {useLocalStorage} from "@/shared/hooks/useLocalStorage";
import "../component-index.scss";

export default function PropIndexPage() {
    const [propQuery, setPropQuery] = useState("");
    const [propSortBy, setPropSortBy, ready] = useLocalStorage("comp-prop-sort", "az");
    const [propSourceFilter, setPropSourceFilter] = useState<PropSource | null>(null);
    const [propStatusFilter, setPropStatusFilter] = useState<PropStatus | null>(null);

    const filteredProps = useMemo(() => {
        const q = propQuery.toLowerCase().trim();
        const results = ALL_PROP_ENTRIES.filter(
            (e) =>
                (!q || e.propName.toLowerCase().includes(q) || e.usedBy.some((c) => c.name.toLowerCase().includes(q))) &&
                (!propSourceFilter || e.source === propSourceFilter) &&
                (!propStatusFilter || e.status === propStatusFilter),
        );
        if (propSortBy === "za") return results.sort((a, b) => b.propName.localeCompare(a.propName, "nb"));
        if (propSortBy === "most-used") return results.sort((a, b) => b.usedBy.length - a.usedBy.length);
        if (propSortBy === "least-used") return results.sort((a, b) => a.usedBy.length - b.usedBy.length);
        return results.sort((a, b) => a.propName.localeCompare(b.propName, "nb"));
    }, [propQuery, propSortBy, propSourceFilter, propStatusFilter]);

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
                <Flex as="ul" className="list-bare" gap="xs" wrap="wrap">
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
                <Flex as="ul" className="list-bare" gap="xs" wrap="wrap">
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
        </Flex>
    );
}
