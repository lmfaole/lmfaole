import "./typography-illustration.scss";

// Four glyphs chosen to reveal specific traits of Fremtind Grotesk:
// g → double-story g (closed loop, distinctive)
// a → double-story a (open aperture, humanist)
// R → curved leg (not a straight spur — humanist detail)
// Ø → Norwegian identity glyph (diagonal strike)
const DETAILS = [
    { char: "g", cls: "g", weight: "bold"   },
    { char: "a", cls: "a", weight: "normal" },
    { char: "R", cls: "r", weight: "bold"   },
    { char: "Ø", cls: "o", weight: "normal" },
] as const;

export function TypographyIllustration() {
    return (
        <div className="fi fi--typography" aria-hidden="true">
            <div className="fi__grid" />
            <span className="fi__ty-letter">A</span>
            {DETAILS.map(({ char, cls, weight }) => (
                <span
                    key={cls}
                    className={`fi__ty-detail fi__ty-detail--${cls} fi__ty-detail--${weight}`}
                >
                    {char}
                </span>
            ))}
        </div>
    );
}
