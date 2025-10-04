const forms = Array.from(document.getElementsByTagName("form"));

function showFormNotification(formInfo) {
    const toast = document.getElementById(`${formInfo.formName}-output`);
    toast.setAttribute("data-type", formInfo.valid ? "success" : "error");

    const heading = document.createElement("h2");
    heading.innerText = `${formInfo.formName} skjema ${formInfo.valid ? " sendt!" : " ikke sendt"}`;

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

    toast.showPopover();
}

function submitForm(form) {
    const formData = new FormData(form);
    let formInfo = {
        formName: form.name,
        submitDate: new Date(),
        valid: form.checkValidity(),
        answers: []
    };

    console.groupCollapsed(`Skjema: ${formInfo.formName} (fullført ${formInfo.submitDate.toLocaleTimeString()})`);
    console.debug(formInfo);

    for (let [key, value] of formData) {
        console.log(value);
        if (value) {
            if (formData.getAll(key).length > 1) {
                formData.set(key, JSON.stringify(formData.getAll(key)));
                formInfo.answers.push({key, value: JSON.parse(formData.getAll(key).toString())});
            } else {
                formInfo.answers.push({key, value});
            }
        }
    }
    console.table(formInfo.answers);
    console.groupEnd();

    showFormNotification(formInfo);
}

function handleFormNavigation(form) {
    const currentSection = form.querySelector("section[aria-current=step]");
    const nextSection = currentSection.nextElementSibling.tagName === "SECTION" && currentSection.nextElementSibling;

    let currentInputs = Array.from(currentSection.querySelectorAll("input"));

    currentInputs.map((input) => {
        if (input.type !== "checkbox") {
            input.required = true
        }
    });

    let invalidInputs = currentInputs.filter((input) => !input.validity.valid);
    let hasInvalidInputs = invalidInputs.length;

    if (nextSection && !hasInvalidInputs) {
        currentSection.setAttribute("aria-current", "");
        nextSection.setAttribute("aria-current", "step");
        currentSection.style.display = "none";
        nextSection.style.display = "block";
    } else if (hasInvalidInputs) {
        form.reportValidity();
    } else {
        submitForm(form);
    }
}

forms.map((form) => {
    const toast = document.createElement("output");
    toast.id = `${form.name}-output`;
    toast.popover = "auto";
    toast.classList.add("toast");
    form.append(toast);

    form.addEventListener("submit", function (ev) {
        ev.preventDefault();
    });

    form.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            handleFormNavigation(form);
        }
    });

    // Multi-step forms
    if (form.classList.contains("steps")) {
        const sections = form.querySelectorAll("section");
        if (sections) {
            Array.from(sections).map((section) => {
                section.id = section.querySelector("h2").innerText;
                section.style.display = "none";

                const nextSection = section.nextElementSibling.tagName === "SECTION" && section.nextElementSibling;
                const previousSection = section.previousElementSibling;
                const currentSection = section.hasAttribute("aria-current");
                if (!currentSection) {
                    sections[0].setAttribute("aria-current", "step");
                    sections[0].style.display = "block";
                }

                const nextSectionButton = document.createElement("button");
                nextSectionButton.classList.add("next");
                nextSectionButton.type = nextSection ? "button" : "submit";
                nextSectionButton.innerText = nextSection ? "Neste" : "Send";
                nextSectionButton.addEventListener("click", () => handleFormNavigation(form));

                const previousSectionButton = document.createElement("button");
                previousSectionButton.classList.add("previous");
                previousSectionButton.type = previousSection ? "button" : "reset";
                previousSectionButton.innerText = previousSection ? "Forrige" : "Tilbakestill";
                previousSectionButton.addEventListener("click", () => {
                    if (previousSection) {
                        section.removeAttribute("aria-current");
                        previousSection.setAttribute("aria-current", "step");
                        section.style.display = "none";
                        previousSection.style.display = "block";
                    }
                });

                const footer = document.createElement("footer");
                footer.append(nextSectionButton, previousSectionButton);
                section.append(footer);
            });
        }
    }
});