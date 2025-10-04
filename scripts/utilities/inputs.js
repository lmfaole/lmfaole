const inputs = Array.from(document.getElementsByTagName("input"));
inputs.map((input) => {
    if (!input.autocomplete) {
        input.autocomplete = "on";
    }

    if (input.type === "checkbox" || input.type === "radio") {
        input.name = input.parentElement.parentElement.children[0].innerText;
        input.value = input.parentElement.innerText;
    } else {
        input.name = input.previousElementSibling.innerText;
    }
});
