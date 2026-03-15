"use client";

import React, {useState} from "react";
import {Link} from "@fremtind/jokul/link";
import {BETA_Select as Select} from "@fremtind/jokul/select";
import {CodeBlock} from "@/shared/components/CodeBlock";
import {slugify, toPascalCase} from "@/shared/utils/format";
import type {ComponentExample as ComponentExampleType} from "@/features/component-docs/docs/types";
import "./component-example.scss";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";
import type {ColorScheme} from "@fremtind/jokul/core";
import {DescriptionDetail, DescriptionList, DescriptionTerm} from "@fremtind/jokul/description-list";

const SIZE_OPTIONS: Array<{ value: "small" | "medium" | "large" | ""; label: string }> = [
    {value: "small", label: "Small"},
    {value: "medium", label: "Medium"},
    {value: "large", label: "Large"},
];

const THEME_OPTIONS: Array<{ value: ColorScheme | ""; label: string }> = [
    {value: "", label: "Auto"},
    {value: "light", label: "Light"},
    {value: "dark", label: "Dark"},
];

interface ComponentExampleProps {
    example: ComponentExampleType;
}

export function ComponentExample({example}: ComponentExampleProps) {
    const [size, setSize] = useState(SIZE_OPTIONS[1].value);
    const [theme, setTheme] = useState(THEME_OPTIONS[0].value);

    return (
        <Card variant="outlined" padding="m">
            <Flex direction="column" gap="none">
                <header className="component-example-header">
                    <h3 id={slugify(example.title)}>{example.title}</h3>

                    {example.description && (
                        <p className="muted">{example.description}</p>
                    )}

                    {example.uses && example.uses.length > 0 && (
                        <DescriptionList>
                            <DescriptionTerm>Består av</DescriptionTerm>
                            {example.uses.map((id) => (
                                <DescriptionDetail key={id}>
                                    <Link href={`/jokul/component/${id}`}>
                                        {toPascalCase(id)}
                                    </Link>
                                </DescriptionDetail>
                            ))}
                        </DescriptionList>
                    )}
                </header>

                {example.preview && (
                    <Flex
                        wrap="wrap"
                        alignItems="center"
                        justifyContent="center"
                        gap="m"
                        className="component-example-preview"
                        {...(size ? {"data-size": size} : {})}
                        {...(theme ? {"data-theme": theme} : {})}
                    >
                        {example.preview}
                    </Flex>
                )}

                {example.preview && (
                    <Flex className="component-example-size-toolbar">
                        <Select
                            label="Theme"
                            name={`theme-${slugify(example.title)}`}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            {THEME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </Select>
                        <Select
                            label="Size"
                            name={`size-${slugify(example.title)}`}
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                        >
                            {SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </Select>
                    </Flex>
                )}

                <CodeBlock code={example.code}/>
            </Flex>
        </Card>
    );
}
