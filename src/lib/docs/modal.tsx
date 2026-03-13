import React from "react";
import { Button } from "@fremtind/jokul/button";
import type { ComponentDoc } from "./types";

function ModalPreview() {
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
    notes: [
        "Bruk useModal() for å sette opp instansen og spre props på riktige elementer.",
        "Modalen rendres i en portal via ReactDOM.createPortal — unngå å stile den ut fra parent-konteksten.",
        "Bruk role='alertdialog' når brukeren ikke skal kunne lukke dialogen med Escape eller klikk utenfor.",
    ],
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
            preview: <ModalPreview />,
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
