import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const MODAL_STATES = [
    { title: "Laster…", body: "Henter forsikringsdetaljer, vennligst vent.", primaryLabel: "Avbryt", secondaryLabel: null },
    { title: "Forsikringsdetaljer", body: "Bilforsikring kasko — Månedspremie: 542 kr. Neste forfall 15. april 2026.", primaryLabel: "Endre dekning", secondaryLabel: "Lukk" },
    { title: "Bekreft sletting", body: "Er du sikker på at du vil slette forsikringen? Handlingen kan ikke angres.", primaryLabel: "Slett forsikring", secondaryLabel: "Avbryt" },
] as const;

function ModalPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 3), 2000);
        return () => clearInterval(id);
    }, [isHovered]);

    const state = MODAL_STATES[step];
    return (
        <div style={{ border: "1px solid var(--jkl-color-border-default)", borderRadius: "8px", padding: "var(--jkl-spacing-l)", maxWidth: "400px", background: "var(--jkl-color-background-default)", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
            <strong style={{ display: "block", fontSize: "1.25em", marginBottom: "var(--jkl-spacing-s)" }}>{state.title}</strong>
            <p style={{ margin: "0 0 var(--jkl-spacing-m)" }}>{state.body}</p>
            <div style={{ display: "flex", gap: "var(--jkl-spacing-s)" }}>
                <Button variant="primary">{state.primaryLabel}</Button>
                {state.secondaryLabel && <Button variant="secondary">{state.secondaryLabel}</Button>}
            </div>
        </div>
    );
}

function ModalBasicPreview() {
    return (
        <div
            style={{
                border: "1px solid var(--jkl-color-border-default)",
                borderRadius: "4px",
                padding: "var(--jkl-spacing-l)",
                maxWidth: "400px",
                background: "var(--jkl-color-background-default)",
            }}
        >
            <strong style={{ display: "block", marginBottom: "var(--jkl-spacing-s)" }}>
                Bekreft handling
            </strong>
            <p style={{ margin: "0 0 var(--jkl-spacing-m)" }}>
                Er du sikker på at du vil slette dette elementet?
            </p>
            <div style={{ display: "flex", gap: "var(--jkl-spacing-s)" }}>
                <Button>Slett</Button>
                <Button variant="secondary">Avbryt</Button>
            </div>
        </div>
    );
}

function AlertDialogPreview() {
    return (
        <div
            style={{
                border: "2px solid var(--jkl-color-border-error)",
                borderRadius: "4px",
                padding: "var(--jkl-spacing-l)",
                maxWidth: "400px",
                background: "var(--jkl-color-background-default)",
            }}
        >
            <strong style={{ display: "block", marginBottom: "var(--jkl-spacing-s)" }}>
                Advarsel
            </strong>
            <p style={{ margin: "0 0 var(--jkl-spacing-m)" }}>
                Denne handlingen kan ikke angres. Alle data vil bli permanent slettet.
            </p>
            <div style={{ display: "flex", gap: "var(--jkl-spacing-s)" }}>
                <Button>Ja, slett alt</Button>
                <Button variant="secondary">Avbryt</Button>
            </div>
        </div>
    );
}

function ConfirmationPreview() {
    return (
        <div
            style={{
                border: "1px solid var(--jkl-color-border-default)",
                borderRadius: "4px",
                padding: "var(--jkl-spacing-l)",
                maxWidth: "400px",
                background: "var(--jkl-color-background-default)",
            }}
        >
            <strong style={{ display: "block", marginBottom: "var(--jkl-spacing-s)" }}>
                Send inn skjema?
            </strong>
            <p style={{ margin: "0 0 var(--jkl-spacing-m)" }}>
                Du er i ferd med å sende inn søknaden. Vil du fortsette?
            </p>
            <div style={{ display: "flex", gap: "var(--jkl-spacing-s)" }}>
                <Button>Send inn</Button>
                <Button variant="secondary">Gå tilbake</Button>
            </div>
        </div>
    );
}

const doc: ComponentDoc = {
    id: "modal",
    name: "Modal",
    package: "@fremtind/jokul/modal",
    category: "Visning",
    tags: ["modal", "dialog", "overlay", "tilgjengelighet", "fokus"],
    status: "stable",
    description:
        "Modal er en dialogboks som vises over resten av innholdet. Den brukes til å be om bekreftelse, vise viktig informasjon eller samle inn data uten å navigere bort fra siden.",
    warnings: [
        "Krev useModal()-hooken for å sette opp instansen og spre trigger- og dialog-props korrekt.",
        "Bruk role='alertdialog' hvis brukeren ikke skal kunne lukke dialogen med Escape eller klikk utenfor.",
    ],
    preview: <ModalPreview />,
    props: [
        {
            name: "title",
            type: "string",
            required: true,
            source: "custom",
            status: "stable",
            description: "Tittel på modalen, sendes til useModal.",
        },
        {
            name: "closeButtonLabel",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            default: '"Lukk"',
            description: "Tilgjengelig label for lukkeknappen.",
        },
        {
            name: "role",
            type: '"dialog" | "alertdialog"',
            required: false,
            source: "aria",
            status: "stable",
            default: '"dialog"',
            description:
                "ARIA-rolle. alertdialog forhindrer lukking med Escape eller klikk utenfor.",
        },
        {
            name: "padding",
            type: "string",
            required: false,
            source: "custom",
            status: "stable",
            description: "Padding på Modal-komponenten, f.eks. 'var(--jkl-spacing-l)'.",
        },
    ],
    examples: [
        {
            title: "Grunnleggende dialog",
            description: "En enkel modal med tittel, innhold og handlingsknapper.",
            uses: ["button"],
            code: `import ReactDOM from "react-dom";
import {
    Modal,
    ModalContainer,
    ModalOverlay,
    ModalHeader,
    ModalTitle,
    ModalCloseButton,
    ModalBody,
    ModalActions,
    useModal,
} from "@fremtind/jokul/modal";
import { Button } from "@fremtind/jokul/button";

function ModalExample() {
    const [instance, { title, overlay, container, modal, closeButton }] = useModal({
        title: "Bekreft handling",
        closeButtonLabel: "Lukk dialog",
    });

    return (
        <>
            <Button onClick={() => instance.show()}>Åpne modal</Button>
            {ReactDOM.createPortal(
                <ModalContainer {...container}>
                    <ModalOverlay {...overlay} />
                    <Modal {...modal}>
                        <ModalHeader>
                            <ModalTitle {...title} />
                            <ModalCloseButton {...closeButton} />
                        </ModalHeader>
                        <ModalBody>
                            <p>Er du sikker på at du vil slette dette elementet?</p>
                        </ModalBody>
                        <ModalActions>
                            <Button onClick={() => instance.hide()}>Slett</Button>
                            <Button variant="secondary" onClick={() => instance.hide()}>
                                Avbryt
                            </Button>
                        </ModalActions>
                    </Modal>
                </ModalContainer>,
                document.body,
            )}
        </>
    );
}`,
            preview: <ModalBasicPreview />,
        },
        {
            title: "Alertdialog (ingen Escape/klikk utenfor)",
            description:
                "Med role='alertdialog' kan ikke brukeren lukke modalen ved å trykke Escape eller klikke utenfor.",
            uses: ["button"],
            code: `import ReactDOM from "react-dom";
import {
    Modal,
    ModalContainer,
    ModalOverlay,
    ModalHeader,
    ModalTitle,
    ModalBody,
    ModalActions,
    useModal,
} from "@fremtind/jokul/modal";
import { Button } from "@fremtind/jokul/button";

function AlertDialogExample() {
    const [instance, { title, overlay, container, modal }] = useModal({
        title: "Advarsel",
        role: "alertdialog",
    });

    return (
        <>
            <Button onClick={() => instance.show()}>Åpne advarselsdialog</Button>
            {ReactDOM.createPortal(
                <ModalContainer {...container}>
                    <ModalOverlay {...overlay} />
                    <Modal {...modal}>
                        <ModalHeader>
                            <ModalTitle {...title} />
                        </ModalHeader>
                        <ModalBody>
                            <p>Denne handlingen kan ikke angres. Alle data vil bli permanent slettet.</p>
                        </ModalBody>
                        <ModalActions>
                            <Button onClick={() => instance.hide()}>Ja, slett alt</Button>
                            <Button variant="secondary" onClick={() => instance.hide()}>
                                Avbryt
                            </Button>
                        </ModalActions>
                    </Modal>
                </ModalContainer>,
                document.body,
            )}
        </>
    );
}`,
            preview: <AlertDialogPreview />,
        },
        {
            title: "Bekreftelsesdialog",
            description: "Modal brukt til å bekrefte en brukerhandling før den utføres.",
            uses: ["button"],
            code: `import ReactDOM from "react-dom";
import {
    Modal,
    ModalContainer,
    ModalOverlay,
    ModalHeader,
    ModalTitle,
    ModalCloseButton,
    ModalBody,
    ModalActions,
    useModal,
} from "@fremtind/jokul/modal";
import { Button } from "@fremtind/jokul/button";

function ConfirmationDialogExample() {
    const [instance, { title, overlay, container, modal, closeButton }] = useModal({
        title: "Send inn skjema?",
    });

    const handleConfirm = () => {
        // utfør handlingen
        instance.hide();
    };

    return (
        <>
            <Button onClick={() => instance.show()}>Send inn</Button>
            {ReactDOM.createPortal(
                <ModalContainer {...container}>
                    <ModalOverlay {...overlay} />
                    <Modal {...modal}>
                        <ModalHeader>
                            <ModalTitle {...title} />
                            <ModalCloseButton {...closeButton} />
                        </ModalHeader>
                        <ModalBody>
                            <p>Du er i ferd med å sende inn søknaden. Vil du fortsette?</p>
                        </ModalBody>
                        <ModalActions>
                            <Button onClick={handleConfirm}>Send inn</Button>
                            <Button variant="secondary" onClick={() => instance.hide()}>
                                Gå tilbake
                            </Button>
                        </ModalActions>
                    </Modal>
                </ModalContainer>,
                document.body,
            )}
        </>
    );
}`,
            preview: <ConfirmationPreview />,
        },
    ],
};

export default doc;
