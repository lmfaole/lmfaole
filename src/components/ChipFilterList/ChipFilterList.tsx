"use client";
import React from "react";
import { Flex } from "@fremtind/jokul/flex";
import { Chip } from "@fremtind/jokul/chip";

interface ChipFilterListProps {
    items: string[];
    selected: string | null;
    onChange: (value: string | null) => void;
    /** Optional label transform, defaults to identity */
    getLabel?: (item: string) => string;
}

export function ChipFilterList({ items, selected, onChange, getLabel }: ChipFilterListProps) {
    return (
        <Flex as="ul" className="chip-list" gap="xs" wrap="wrap">
            {items.map((item) => (
                <li key={item}>
                    <Chip
                        variant="filter"
                        selected={selected === item}
                        onClick={() => onChange(selected === item ? null : item)}
                    >
                        {getLabel ? getLabel(item) : item}
                    </Chip>
                </li>
            ))}
        </Flex>
    );
}
