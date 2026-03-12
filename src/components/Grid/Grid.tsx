import React from "react";
import "./grid.scss";

export type SemanticSpacing = "none" | "xxs" | "xs" | "s" | "m" | "l" | "xl";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
    gap?: SemanticSpacing;
}

export function Grid({ as: Tag = "div", gap = "m", className, children, ...rest }: GridProps) {
    const classes = ["grid", className].filter(Boolean).join(" ");
    return (
        <Tag className={classes} data-gap={`var(--jkl-spacing-${gap})`} {...rest}>
            {children}
        </Tag>
    );
}
