function createDescriptionListFromInputs(outputNode, inputElements) {
    const output = document.getElementById(outputNode);

    const list = document.createElement("dl");
    list.ariaLabel = "Dine valg";
    const listHeading = document.createElement("h2");
    listHeading.innerText = "Dine valg";

    inputElements.map((input) => {
        if(input.value) {
            const descriptionTerm = document.createElement("dt");
            descriptionTerm.innerText = input.previousElementSibling.innerText;

            const descriptionDetail = document.createElement("dd");
            if(input.type === "date") {
                descriptionDetail.innerText = new Date(input.value).toLocaleDateString(navigator.language, {...defaultDateFormat,  weekday: "long" });
            } else {
            descriptionDetail.innerText = input.value;
            }

            list.append(descriptionTerm, descriptionDetail);
        }
    });

    output.replaceChildren(listHeading, list);
}