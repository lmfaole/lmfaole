"use client";

import React, {useState} from "react";
import {Button} from "@fremtind/jokul/button";
import {Icon} from "@fremtind/jokul/icon";
import "./code-block.scss";
import {Card} from "@fremtind/jokul/card";
import {Flex} from "@fremtind/jokul/flex";

interface CodeBlockProps {
    code: string;
    title?: React.ReactNode | string;
    language?: string;
    hideCopyButton?: boolean;
}

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

export function CodeBlock({code, title = "Kode", language, hideCopyButton}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const lang = language ?? detectLanguage(code);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="code-block" padding="l">
            <Flex as="header" justifyContent="space-between" alignItems="center" gap="s" wrap="wrap">
                <p>{title} <code>.{lang}</code></p>
                {!hideCopyButton && <div className="code-block__copy">
                    <Button
                        variant="ghost"
                        onClick={handleCopy}
                        icon={<Icon>{copied ? "check" : "content_copy"}</Icon>}
                        iconPosition="right"
                        aria-label={copied ? "Kode kopiert" : "Kopier kode"}
                    >
                        {copied ? "Kopiert" : "Kopier"}
                    </Button>
                </div>}
            </Flex>
            <pre className="code-block__pre"><code>{code.trim()}</code></pre>
        </Card>
    );
}
