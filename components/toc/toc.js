export class Toc extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();
    }

    connectedCallback() {
        console.log("Toc added to page");

        const shadow = this.attachShadow({mode: "open"});
        const styles = document.createElement("link");
        styles.setAttribute("rel", "stylesheet");
        styles.setAttribute("href", "/components/toc/toc.css");

        const wrapper = document.createElement("div");
        const title = document.createElement("h2");
        const nav = document.createElement("nav");
        const list = document.createElement("ol");

        title.textContent = "Innhold";
        title.id = "toc-title";
        nav.setAttribute("aria-labelledby", title.id);
        wrapper.classList.add("toc");

        Object.values(document.querySelectorAll("article > h2, article > h3")).map((heading) => {
            const id = heading.innerText.replaceAll(" ", "-").toLowerCase();
            heading.id = id;

            const li = document.createElement("li");
            const link = document.createElement("a");

            link.innerText = heading.innerText;
            link.href = `#${id}`;

            li.appendChild(link);
            list.append(li);
        });

        shadow.appendChild(styles);
        wrapper.append(title, nav);
        nav.appendChild(list);
        shadow.appendChild(wrapper);
    }

    disconnectedCallback() {
        console.log("Custom element removed from page.");
    }

    connectedMoveCallback() {
        console.log("Custom element moved with moveBefore()");
    }

    adoptedCallback() {
        console.log("Custom element moved to new page.");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed.`);
    }
}

customElements.define("toc-party", Toc);