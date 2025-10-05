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

    // Datalist
    if (input.type === "text" && input.classList.contains("autosuggest")) {
        if (!input.list) {
            import(`/data/${input.attributes.list.nodeValue}.json`, {with: {type: "json"}})
                .then((Response) => {
                    const data = Response.default;
                    const datalist = document.createElement("datalist");
                    datalist.id = `${input.id}-list`;
                    input.setAttribute("list", datalist.id);
                    data.map((line) => {
                        const option = document.createElement("option");
                        option.value = line[Object.keys(line)[0]];
                        datalist.append(option);
                    });
                    input.parentElement.append(datalist);
                });

        }
        input.addEventListener("input", (ev) => console.log(ev.target.value))
    }
});
