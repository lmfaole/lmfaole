import type React from "react";
import "./motion-illustration.scss";

// Each curve represents a timing tier. Particles travel its path at the tier's speed.
const CURVES = [
    { id: "mo-p1", d: "M 0,40 C 80,10 200,170 400,50",          tier: "energetic",  dur: 2200  },
    { id: "mo-p3", d: "M 0,170 C 80,170 200,50 400,50",          tier: "productive", dur: 4800 },
    { id: "mo-p5", d: "M 0,120 C 130,220 270,20 400,120",        tier: "lazy",       dur: 12000 },
] as const;

export function MotionIllustration() {
    return (
        <div className="fi fi--motion" aria-hidden="true">
            <svg
                className="fi__mo-svg"
                viewBox="0 0 400 240"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    {/* Geometry refs for offset-path — no pathLength so % works naturally */}
                    {CURVES.map(({ id, d }) => (
                        <path key={id} id={id} d={d} />
                    ))}
                </defs>

                {CURVES.map(({ id, d, tier, dur }, i) => (
                    <g
                        key={id}
                        className={`fi__mo-group fi__mo-group--${tier}`}
                        style={{ "--mo-dur": `${dur}ms`, "--mo-i": i } as React.CSSProperties}
                    >
                        {/* Track stroke — draws in on hover via stroke-dashoffset */}
                        <path className="fi__mo-track" d={d} pathLength={1} />
                        {/* Two particles staggered along the path */}
                        <circle className="fi__mo-particle" r="2" />
                    </g>
                ))}
            </svg>
        </div>
    );
}
