import "./spacing-illustration.scss";

export function SpacingIllustration() {
    return (
        <div className="fi fi--spacing" aria-hidden="true">
            <div className="fi__sp-rings">
                <div className="fi__sp-ring fi__sp-ring--1" />
                <div className="fi__sp-ring fi__sp-ring--2" />
                <div className="fi__sp-ring fi__sp-ring--3" />
                <div className="fi__sp-ring fi__sp-ring--4" />
                <div className="fi__sp-ring fi__sp-ring--5" />
            </div>
        </div>
    );
}
