import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { Card } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


function ModalBasicPreview() {
    return (
        <Card padding="l" style={{ maxWidth: "400px", width: "100%" }}>
            <Flex direction="column" gap="m">
                <strong>Bekreft handling</strong>
                <p>Er du sikker på at du vil slette dette elementet?</p>
                <Flex gap="s">
                    <Button>Slett</Button>
                    <Button variant="secondary">Avbryt</Button>
                </Flex>
            </Flex>
        </Card>
    );
}

function AlertDialogPreview() {
    return (
        <Card variant="outlined" padding="l" style={{ maxWidth: "400px", width: "100%", borderColor: "var(--jkl-color-border-error)" }}>
            <Flex direction="column" gap="m">
                <strong>Advarsel</strong>
                <p>Denne handlingen kan ikke angres. Alle data vil bli permanent slettet.</p>
                <Flex gap="s">
                    <Button>Ja, slett alt</Button>
                    <Button variant="secondary">Avbryt</Button>
                </Flex>
            </Flex>
        </Card>
    );
}

function ConfirmationPreview() {
    return (
        <Card padding="l" style={{ maxWidth: "400px", width: "100%" }}>
            <Flex direction="column" gap="m">
                <strong>Send inn skjema?</strong>
                <p>Du er i ferd med å sende inn søknaden. Vil du fortsette?</p>
                <Flex gap="s">
                    <Button>Send inn</Button>
                    <Button variant="secondary">Gå tilbake</Button>
                </Flex>
            </Flex>
        </Card>
    );
}


export const examples: ComponentExample[] = [
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


    const isHovered = usePreviewHovered();

    const [step, setStep] = useState(0);

        const id = setInterval(() => setStep(s => (s + 1) % 3), 2000);

    const state = MODAL_STATES[step];
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
            }
];
