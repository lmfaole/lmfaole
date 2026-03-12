"use client";

import React, { useState } from "react";
import "./code-block.scss";

interface CodeBlockProps {
    code: string;
    language?: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="code-block">
            <button
                className="code-block__copy"
                onClick={handleCopy}
                aria-label={copied ? "Kode kopiert" : "Kopier kode"}
            >
                {copied ? "Kopiert ✓" : "Kopier"}
            </button>
            <pre className="code-block__pre"><code>{code.trim()}</code></pre>
        </div>
    );
}
