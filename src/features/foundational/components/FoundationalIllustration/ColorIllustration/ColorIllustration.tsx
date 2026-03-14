import "./color-illustration.scss";

export function ColorIllustration() {
    return (
        <div className="fi fi--colors" aria-hidden="true">
            <div className="fi__cl-light" />
            <div className="fi__sphere fi__sphere--granitt" />
            <div className="fi__sphere fi__sphere--skifer" />
            <div className="fi__sphere fi__sphere--stein" />
            <div className="fi__sphere fi__sphere--varde" />
        </div>
    );
}
