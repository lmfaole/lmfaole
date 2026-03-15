import { ScreenReaderOnly } from "@fremtind/jokul/screen-reader-only";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentExample } from "../types";


function BasicPreview() {
    return (
        <div>
            <div
                style={{
                    border: "1px dashed var(--jkl-color-border-default)",
                    padding: "var(--jkl-spacing-m)",
                    borderRadius: "4px",
                    marginBottom: "var(--jkl-spacing-s)",
                }}
            >
                <span aria-hidden="true" style={{ color: "var(--jkl-color-text-subdued)" }}>
                    (ScreenReaderOnly-innhold er usynlig her)
                </span>
                <ScreenReaderOnly>
                    Dette er kun synlig for skjermlesere og vises ikke visuelt.
                </ScreenReaderOnly>
            </div>
            <p style={{ margin: 0, fontSize: "var(--jkl-font-size-small)", color: "var(--jkl-color-text-subdued)" }}>
                Innholdet skjules visuelt, men er tilgjengelig for hjelpemiddelteknologi.
            </p>
        </div>
    );
}

function SkipLinkPreview() {
    return (
        <div
            style={{
                border: "1px dashed var(--jkl-color-border-default)",
                padding: "var(--jkl-spacing-m)",
                borderRadius: "4px",
            }}
        >
            <ScreenReaderOnly showOnFocus>
                <a href="#main-content" style={{ padding: "var(--jkl-spacing-s)" }}>
                    Hopp til hovedinnhold
                </a>
            </ScreenReaderOnly>
            <p style={{ margin: 0, fontSize: "var(--jkl-font-size-small)", color: "var(--jkl-color-text-subdued)" }}>
                Tab inn i boksen for å se hopplenken bli synlig (showOnFocus).
            </p>
        </div>
    );
}

function IconButtonPreview() {
    return (
        <Flex alignItems="center" gap="s">
            <button
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "var(--jkl-spacing-xs)",
                    display: "inline-flex",
                    alignItems: "center",
                }}
                aria-label="Slett element"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                </svg>
                <ScreenReaderOnly>Slett element</ScreenReaderOnly>
            </button>
            <span style={{ fontSize: "var(--jkl-font-size-small)", color: "var(--jkl-color-text-subdued)" }}>
                Ikonknapp — kun synlig for skjermlesere via ScreenReaderOnly
            </span>
        </Flex>
    );
}


export const examples: ComponentExample[] = [
    {
                title: "Grunnleggende bruk",
                description: "Innholdet er usynlig visuelt, men tilgjengelig for skjermlesere.",
                code: `import { ScreenReaderOnly } from "@fremtind/jokul/screen-reader-only";

    <ScreenReaderOnly>
        Dette er kun synlig for skjermlesere og vises ikke visuelt.
    </ScreenReaderOnly>`,
                preview: <BasicPreview />,
            },
    {
                title: "Skip-link med showOnFocus",
                description:
                    "Med showOnFocus vises innholdet kun når det er fokusert — standard mønster for hopplenker.",
                code: `import { ScreenReaderOnly } from "@fremtind/jokul/screen-reader-only";

    <ScreenReaderOnly showOnFocus>
        <a href="#main-content">Hopp til hovedinnhold</a>
    </ScreenReaderOnly>`,
                preview: <SkipLinkPreview />,
            },
    {
                title: "Tilgjengelig label for ikonknapp",
                description:
                    "Bruk ScreenReaderOnly til å gi ikonknapper en meningsfull tekst for skjermlesere.",
                code: `import { ScreenReaderOnly } from "@fremtind/jokul/screen-reader-only";

    <button aria-label="Slett element">
        <TrashIcon aria-hidden />
        <ScreenReaderOnly>Slett element</ScreenReaderOnly>
    </button>`,
                preview: <IconButtonPreview />,
            }
];
