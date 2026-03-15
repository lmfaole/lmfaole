"use client";

import {CopyButton} from "./CopyButton";
import "./code-block.scss";
import {ExpandablePanel} from "@fremtind/jokul/expander";

interface CodeBlockProps {
    code: string;
    label?: string;
}

export function CodeBlock({code, label = "Kode"}: CodeBlockProps) {
    const trimmed = code.trim();

    return (
        <ExpandablePanel className="code-block">
            <ExpandablePanel.Header>
                {label}
            </ExpandablePanel.Header>
            <ExpandablePanel.Content>
                <div className="code-block__content">
                    <CopyButton code={trimmed} className="code-block__copy"/>
                    <pre className="code-block__pre"><code>{trimmed}</code></pre>
                </div>
            </ExpandablePanel.Content>
        </ExpandablePanel>
    );
}
