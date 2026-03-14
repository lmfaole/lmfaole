"use client";

import React, {useState} from "react";
import {CopyButton} from "./CopyButton";
import "./code-block.scss";
import {Card} from "@fremtind/jokul/card";
import {IconButton} from "@fremtind/jokul/icon-button";
import {Icon} from "@fremtind/jokul/icon";

interface CodeBlockProps {
    code: string;
    hideCopyButton?: boolean;
    bare?: boolean;
    collapsible?: boolean;
    size?: "small" | "medium";
}

export function CodeBlock({code, hideCopyButton, bare, collapsible, size}: CodeBlockProps) {
    const [open, setOpen] = useState(false);
    const sizeAttr = size === "small" ? {"data-size": "small" as const} : {};
    const isExpanded = !collapsible || open;

    const toolbar = (
        <div className="code-block__toolbar">
            <span className="code-block__lang">Kode</span>
            <div className="code-block__toolbar-actions">
                {!hideCopyButton && isExpanded && <CopyButton code={code.trim()}/>}
                {collapsible && (
                    <IconButton
                        onClick={() => setOpen(o => !o)}
                        aria-label={open ? "Skjul kode" : "Vis kode"}
                        className={`code-block__toggle${open ? " code-block__toggle--open" : ""}`}
                    >
                        <Icon>expand_more</Icon>
                    </IconButton>
                )}
            </div>
        </div>
    );

    const inner = (
        <>
            {toolbar}
            {isExpanded && <pre><code>{code.trim()}</code></pre>}
        </>
    );

    if (bare) {
        return <div className="code-block" {...sizeAttr}>{inner}</div>;
    }

    return <Card className="code-block" {...sizeAttr}>{inner}</Card>;
}
