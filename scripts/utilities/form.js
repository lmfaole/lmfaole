const forms = Array.from(document.getElementsByTagName("form"));

function submitForm(form) {
    const formData = new FormData(form);
    let formInfo = {
        meta: {
            name: form.name,
            submitDate: new Date(),
        },
        answers: []
    };

    console.groupCollapsed(`Skjema: ${formInfo.meta.name} (fullført ${formInfo.meta.submitDate.toLocaleTimeString()})`);
    console.debug(formInfo);
    for (const [key, value] of formData) {
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

forms.map((form) => form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    submitForm(form);
}));