const forms = Array.from(document.getElementsByTagName("form"));

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

    return formInfo;
}

function handleFormNavigation(form) {
    const currentSection = form.querySelector("section[aria-current=step]");
    const nextSection = currentSection.nextElementSibling;

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
    } else if (hasInvalidInputs) {
        form.reportValidity();
    } else {
        submitForm(form);
    }
}

forms.map((form) => {
    form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        submitForm(form);
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

                const nextSection = section.nextElementSibling;
                const previousSection = section.previousElementSibling;
                const currentSection = section.hasAttribute("aria-current");
                if (!currentSection) {
                    sections[0].setAttribute("aria-current", "step");
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
                    }
                });

                const footer = document.createElement("footer");
                footer.append(nextSectionButton, previousSectionButton);
                section.append(footer);
            });
        }
    }
});