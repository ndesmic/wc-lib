const styles = document.createElement("style");
styles.textContent = `
    wc-copy-button-decorator {
        display: contents;

        .wc-copy-button-decorator-button {
            position: fixed;
            right: calc(anchor(right) + 0.5rem);
            top: calc(anchor(top) + 0.5rem);
            opacity: 0.5;
            padding: 0.25rem;
            background-color: transparent;

            &::before {
                content: "📋";
                filter: grayscale(100%);
            }
            &.clicked {
                background-color: var(--primary-light-1);
                opacity: 1.0;
                color: var(--text);

                &::before {
                    content: "copied!";
                }
            }
            &:hover {
                background-color: var(--primary-light-1);
                opacity: 1.0;
            }
            &:active {
                background-color: var(--primary-medium);
            }
        }
        &[inline] .wc-copy-button-decorator-button {
            top: calc(anchor(top) + 0.25rem);
        }
        &[inline-attached] {
            input, output {
                padding-right: 2rem;
            }
            .wc-copy-button-decorator-button {
                right: anchor(right);
                top: anchor(top);
                bottom: anchor(bottom);
                background-color: var(--primary-medium);
                opacity: 1.0;
                border-radius: 0;
                color: var(--text-alt);
            }
        }
    }
`;
document.head.appendChild(styles);

export class WcCopyButtonDecorator extends HTMLElement {
    connectedCallback(){
        this.bind();
        this.renderDom();
        this.attachEvents();
    }
    bind(){
        this.onCopyClick = this.onCopyClick.bind(this);
    }
    renderDom(){
        this.dom = {};
        this.dom.copy = document.createElement("button");
        this.dom.copy.classList.add("wc-copy-button-decorator-button");
        this.append(this.dom.copy);

        this.dom.elementToCopy = this.querySelector("input, output, textarea");
        if(!this.dom.elementToCopy.id){
            console.warn("The decorated input element had no id. Copy button decorator will not work.");
        }
        this.dom.elementToCopy.style.anchorName = `--${this.dom.elementToCopy.id}-anchor`;
        this.dom.copy.style.positionAnchor = `--${this.dom.elementToCopy.id}-anchor`;
    }
    attachEvents(){
        this.dom.copy.addEventListener("click", this.onCopyClick);
    }
    async onCopyClick(){
        try {
            await navigator.clipboard.writeText(this.dom.elementToCopy.value);
            this.dom.copy.classList.add("clicked");
            setTimeout(() => {
                this.dom.copy.classList.remove("clicked");
            }, 1000);
        } catch (error) {
            console.log('Failed to copy to clipboard: ' + error);
        }
    }
}

customElements.define("wc-copy-button-decorator", WcCopyButtonDecorator);