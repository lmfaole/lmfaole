import type React from "react";
import "./border-radius-illustration.scss";

/*
 * Each shape shows one step of the border-radius scale.
 * They animate in staggered, morphing their border-radius from 0 to full.
 */
const SHAPES = [
    { token: "--jkl-border-radius-none", delay: 0    },
    { token: "--jkl-border-radius-xs",   delay: -1.5 },
    { token: "--jkl-border-radius-s",    delay: -3   },
    { token: "--jkl-border-radius-m",    delay: -4.5 },
    { token: "--jkl-border-radius-l",    delay: -6   },
    { token: "--jkl-border-radius-full", delay: -7.5 },
] as const;

export function BorderRadiusIllustration() {
    return (
        <div className="fi fi--border-radius" aria-hidden="true">
            <div className="fi__br-grid">
                {SHAPES.map(({ token, delay }, i) => (
                    <div
                        key={i}
                        className="fi__br-shape"
                        style={{
                            "--br-radius": `var(${token})`,
                            "--br-delay":  `${delay}s`,
                            "--br-i":      i,
                        } as React.CSSProperties}
                    />
                ))}
            </div>
        </div>
    );
}
