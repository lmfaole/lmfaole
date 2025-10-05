const forms = Array.from(document.getElementsByTagName("form"));

// Toast
function showFormNotification(formInfo, form) {
    const toast = document.getElementById(`${formInfo.formName}-output`);
    toast.setAttribute("data-type", formInfo.valid ? "success" : "error");

    const heading = document.createElement("h2");
    heading.innerText = `${formInfo.formName} skjema ${formInfo.valid ? " sendt!" : " ikke sendt"}`;

    if (formInfo.valid) {
        const answerDetails = document.createElement("details");
        const answerDetailsHeading = document.createElement("summary");
        answerDetailsHeading.innerText = "Se dine svar";
        answerDetails.append(answerDetailsHeading);

        const answerDetailsDescriptionList = document.createElement("dl");
        formInfo.answers.map((answer) => {
            const answerDetailsDescriptionTerm = document.createElement("dt");
            const answerDetailsDescriptionDetail = document.createElement("dd");

            answerDetailsDescriptionTerm.innerText = answer.key;
            answerDetailsDescriptionDetail.innerText = typeof answer.value === "object" ? answer.value.join(", ") : answer.value;

            answerDetailsDescriptionList.append(answerDetailsDescriptionTerm, answerDetailsDescriptionDetail);
        });

        answerDetails.appendChild(answerDetailsDescriptionList);
        toast.replaceChildren(heading, answerDetails);
    } else {
        const errorMessage = document.createElement("p");
        if (formInfo.answers.length === 0) {
            errorMessage.innerText = "Ingen svar registrert, se over skjema igjen";
            form.getElementsByTagName("input")[0].focus();
        }
        toast.replaceChildren(heading, errorMessage);
    }

    toast.showPopover();
}

// Submit function
function submitForm(form) {
    const formData = new FormData(form);
    let formInfo = {
        formName: form.name,
        submitDate: new Date(),
        valid: true,
        answers: []
    };

    console.groupCollapsed(`Skjema: ${formInfo.formName} (fullført ${formInfo.submitDate.toLocaleTimeString()})`);
    console.debug(formInfo);

    for (let [key, value] of formData) {
        if (value && value.size !== 0) {
            console.debug(value);
            if (formData.getAll(key).length > 1) {
                formData.set(key, JSON.stringify(formData.getAll(key)));
                formInfo.answers.push({key, value: JSON.parse(formData.getAll(key).toString())});
            } else {
                formInfo.answers.push({key, value});
            }
        }
    }

    if (formInfo.answers.length === 0) {
        formInfo.valid = false
    } else {
        console.table(formInfo.answers);
    }

    console.groupEnd();

    showFormNotification(formInfo, form);
}

// Multistep forms
function createMultistepForm(form) {
    const sections = Array.from(form.querySelectorAll("section"));
    const firstSection = sections[0];
    let currentSection = sections.filter((section) => section.hasAttribute("aria-current"))[0];
    if (!currentSection) {
        firstSection.setAttribute("aria-current", "step");
        currentSection = firstSection;
    }
    let nextSection = sections[sections.indexOf(currentSection) + 1];
    let previousSection = sections[sections.indexOf(currentSection) - 1];

    let currentInputs = Array.from(currentSection.querySelectorAll("input"));
    currentInputs.map((input) => {
        if (input.type !== "checkbox") {
            input.required = true
        }
    });

    const nextSectionButton = document.createElement("button");
    nextSectionButton.classList.add("next");
    nextSectionButton.addEventListener("click", (ev) => handleNavigation(ev));

    const previousSectionButton = document.createElement("button");
    previousSectionButton.classList.add("previous");
    previousSectionButton.addEventListener("click", (ev) => handleNavigation(ev));

    const footer = document.createElement("footer");
    footer.append(nextSectionButton, previousSectionButton);
    form.append(footer);

    // Update state of form
    function updateFormState(direction) {
        switch (direction) {
            case "next":
                currentSection.removeAttribute("aria-current");
                nextSection.setAttribute("aria-current", "step");
                break;
            case "previous":
                currentSection.removeAttribute("aria-current");
                previousSection.setAttribute("aria-current", "step");
                break;
            default:
        }

        currentSection = sections.filter((section) => section.hasAttribute("aria-current"))[0];
        nextSection = sections[sections.indexOf(currentSection) + 1];
        previousSection = sections[sections.indexOf(currentSection) - 1];

        currentInputs = Array.from(currentSection.querySelectorAll("input"));
        currentInputs.map((input) => {
            if (input.type !== "checkbox") {
                input.required = true
            }
        });

        nextSectionButton.type = nextSection ? "button" : "submit";
        nextSectionButton.innerText = nextSection ? "Neste" : "Send";
        previousSectionButton.type = previousSection ? "button" : "reset";
        previousSectionButton.innerText = previousSection ? "Forrige" : "Tilbakestill";
    }

    updateFormState();

    // Navigation of form
    function handleNavigation(ev) {
        let hasNextSection = !!nextSection;
        let hasPreviousSection = !!previousSection;

        const isNextButton = ev.currentTarget.classList.contains("next");
        const isPreviousButton = ev.currentTarget.classList.contains("previous");

        const invalidInputs = currentInputs.filter((input) => !input.validity.valid);
        const hasInvalidInputs = !!invalidInputs.length;

        if (isNextButton) {
            if (hasNextSection) {
                if (hasInvalidInputs) {
                    form.reportValidity();
                } else {
                    updateFormState("next");
                }
            } else {
                if (hasInvalidInputs) {
                    form.reportValidity();
                } else {
                    submitForm(form);
                }
            }
        } else {
            if (hasPreviousSection) {
                updateFormState("previous");
            }
        }
    }

    form.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            handleNavigation(form);
        }
    });
}

forms.map((form) => {
    const submitButton = form.querySelector("button[type=submit]");

    const toast = document.createElement("output");
    toast.id = `${form.name}-output`;
    toast.popover = "auto";
    toast.classList.add("toast");
    form.append(toast);

    form.addEventListener("submit", function (ev) {
        ev.preventDefault();
    });

    // Multi-step forms
    if (form.classList.contains("steps") && !submitButton) {
        createMultistepForm(form);
    } else if (submitButton) {
        submitButton.addEventListener("click", () => submitForm(form));
    }
});