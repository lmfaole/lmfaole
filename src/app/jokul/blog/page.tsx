"use client";

import { useState, useMemo } from "react";
import { Flex } from "@fremtind/jokul/flex";
import { Search } from "@fremtind/jokul/search";
import { BETA_Select as Select } from "@fremtind/jokul/select";
import { blogPosts } from "@/features/blog/data";
import { BlogPostCard } from "@/shared/components/BlogPostCard";
import { Grid } from "@/shared/components/Grid";

export default function BlogPage() {
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        const results = blogPosts.filter((post) => {
            return (
                !q ||
                post.title.toLowerCase().includes(q) ||
                post.excerpt.toLowerCase().includes(q)
            );
        });
        return results.sort((a, b) => {
            if (sortBy === "oldest") return a.id - b.id;
            if (sortBy === "az") return a.title.localeCompare(b.title, "nb");
            if (sortBy === "za") return b.title.localeCompare(a.title, "nb");
            return b.id - a.id; // newest
        });
    }, [query, sortBy]);

    return (
        <Flex as="main" direction="column" gap="xl">
            <h1>Blogg</h1>
            <p>Artikler om Jøkul — designsystemet til Fremtind. Tips, dybdeanalyser og god praksis for deg som bygger med komponentbiblioteket.</p>

            <Flex gap="m" alignItems="end" wrap="wrap">
                <Search
                    label="Søk i artikler"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tittel eller beskrivelse…"
                />
                <Select
                    label="Sorter"
                    name="sort-blog"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="newest">Nyeste først</option>
                    <option value="oldest">Eldste først</option>
                    <option value="az">A–Å</option>
                    <option value="za">Å–A</option>
                </Select>
            </Flex>

            {filtered.length === 0 ? (
                <p className="muted">Ingen artikler samsvarer med søket.</p>
            ) : (
                <Grid columns={3} gap="l">
                    {filtered.map((post) => (
                        <BlogPostCard key={post.id} post={post} />
                    ))}
                </Grid>
            )}
        </Flex>
    );
}
