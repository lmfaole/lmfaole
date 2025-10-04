const forms = Array.from(document.getElementsByTagName("form"));

function submitForm(form) {
    let answers = [];

    const formData = new FormData(form);
    console.groupCollapsed(`Skjema: ${form.name}`);
    for (const [key, value] of formData) {
        console.debug({key, value})
        answers.push({key, value});
    }
    console.groupEnd();

    return answers;
}

forms.map((form) => form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    submitForm(form);
}));