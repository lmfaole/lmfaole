"use client";

import React, { useState, useMemo } from "react";
import { Flex } from "@fremtind/jokul/flex";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Search } from "@fremtind/jokul/search";
import { BETA_Select as Select } from "@fremtind/jokul/select";
import { blogPosts } from "@/lib/blogPosts";
import { BlogPostCard } from "@/components/BlogPostCard";
import { ChipFilterList } from "@/components/ChipFilterList";
import { Grid } from "@/components/Grid";

const ALL_TAGS = Array.from(new Set(blogPosts.flatMap((p) => p.tags))).sort();
const ALL_CATEGORIES = Array.from(new Set(blogPosts.map((p) => p.category))).sort();

export default function BlogPage() {
    const [query, setQuery] = useState("");
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState("newest");

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        const results = blogPosts.filter((post) => {
            const matchesQuery =
                !q ||
                post.title.toLowerCase().includes(q) ||
                post.excerpt.toLowerCase().includes(q) ||
                post.tags.some((t) => t.toLowerCase().includes(q));
            const matchesTag = !activeTag || post.tags.includes(activeTag);
            const matchesCategory = !activeCategory || post.category === activeCategory;
            return matchesQuery && matchesTag && matchesCategory;
        });
        return results.sort((a, b) => {
            if (sortBy === "oldest") return a.id - b.id;
            if (sortBy === "az") return a.title.localeCompare(b.title, "nb");
            if (sortBy === "za") return b.title.localeCompare(a.title, "nb");
            return b.id - a.id; // newest
        });
    }, [query, activeTag, activeCategory, sortBy]);



    return (
        <Flex as="main" direction="column" gap="xl">
            <NavLink href="/jokul" back>Tilbake til forsiden</NavLink>
            <h1>Blogg</h1>
            <p>Artikler om Jøkul — designsystemet til Fremtind. Tips, dybdeanalyser og god praksis for deg som bygger med komponentbiblioteket.</p>

            <Flex direction="column" gap="m">
                <Flex gap="m" alignItems="end" wrap="wrap">
                    <Search
                        label="Søk i artikler"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Tittel, beskrivelse eller tag…"
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
                <p className="muted">Kategori</p>
                <ChipFilterList items={ALL_CATEGORIES} selected={activeCategory} onChange={setActiveCategory} />
                <p className="muted">Tags</p>
                <ChipFilterList items={ALL_TAGS} selected={activeTag} onChange={setActiveTag} />
            </Flex>

            {filtered.length === 0 ? (
                <p className="muted">Ingen artikler samsvarer med filteret.</p>
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
