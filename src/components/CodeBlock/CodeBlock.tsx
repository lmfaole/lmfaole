"use client";

import React, {useState} from "react";
import {Expander} from "@fremtind/jokul/expander";
import {CopyButton} from "./CopyButton";
import "./code-block.scss";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";

const LANG_LABELS: Record<string, string> = {
    tsx: "TSX",
    ts: "TypeScript",
    js: "JavaScript",
    jsx: "JSX",
    css: "CSS",
    scss: "SCSS",
    sh: "Shell",
    html: "HTML",
    json: "JSON",
    code: "Code",
};

function detectLanguage(code: string): string {
    const trimmed = code.trim();
    if (/^[$#]|^\s*(npm |yarn |pnpm |git |cd |ls |mkdir |rm |cat |echo |curl )/.test(trimmed)) return "sh";
    if (/^\s*[.#@]?[\w-]+\s*\{[\s\S]*\}/.test(trimmed) && !/</.test(trimmed)) return "css";
    if (/^<(!DOCTYPE|html|div|span|p|a|ul|ol|li|section|article|header|footer|nav|main)\b/i.test(trimmed)) return "html";
    if (/<[A-Z][A-Za-z]*[\s/>]/.test(trimmed) || /\buseState\b|\buseEffect\b/.test(trimmed)) return "tsx";
    if (/\binterface\b|\btype\s+\w+\s*=|\bas\s+\w|\bReadonly\b|:\s*(string|number|boolean|void)\b/.test(trimmed)) return "ts";
    if (/^\s*[{[]/.test(trimmed) && /"\w+":\s/.test(trimmed)) return "json";
    if (/\b(const|let|var|function|import|export|class|=>|async|await)\b/.test(trimmed)) return "ts";
    return "code";
}

interface CodeBlockProps {
    code: string;
    language?: string;
    hideCopyButton?: boolean;
    bare?: boolean;
    collapsible?: boolean;
}

function CodeBlockContent({code, lang, hideCopyButton, collapsible}: {code: string; lang: string; hideCopyButton?: boolean; collapsible?: boolean}) {
    const [open, setOpen] = useState(false);

    if (collapsible) {
        return (
            <>
                <Flex className="code-block__toolbar" alignItems="stretch">
                    {!hideCopyButton && <CopyButton code={code.trim()}/>}
                    <Expander open={open} onClick={() => setOpen(o => !o)} expandDirection="down" className="code-block__expander">
                        <code>{LANG_LABELS[lang] ?? lang.toUpperCase()}</code>
                    </Expander>
                </Flex>
                {open && <pre><code>{code.trim()}</code></pre>}
            </>
        );
    }

    return (
        <>
            <div className="code-block__toolbar">
                <Flex justifyContent="space-between" alignItems="center" gap="s" wrap="wrap" style={{padding: "var(--jkl-spacing-s) var(--jkl-spacing-m)"}}>
                    <code>{LANG_LABELS[lang] ?? lang.toUpperCase()}</code>
                    {!hideCopyButton && <CopyButton code={code.trim()}/>}
                </Flex>
            </div>
            <pre><code>{code.trim()}</code></pre>
        </>
    );
}

export function CodeBlock({code, language, hideCopyButton, bare, collapsible}: CodeBlockProps) {
    const lang = language ?? detectLanguage(code);

    if (bare) {
        return (
            <div className="code-block">
                <CodeBlockContent code={code} lang={lang} hideCopyButton={hideCopyButton} collapsible={collapsible}/>
            </div>
        );
    }

    return (
        <Card className="code-block">
            <CodeBlockContent code={code} lang={lang} hideCopyButton={hideCopyButton} collapsible={collapsible}/>
        </Card>
    );
}
