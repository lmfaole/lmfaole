import "./breakpoints-illustration.scss";

export function BreakpointsIllustration() {
    return (
        <div className="fi fi--breakpoints" aria-hidden="true">
            <div className="fi__bp-screen">
                <div className="fi__bp-bar fi__bp-bar--1" />
                <div className="fi__bp-bar fi__bp-bar--2" />
                <div className="fi__bp-bar fi__bp-bar--3" />
            </div>
        </div>
    );
}
