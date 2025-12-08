const styles = document.createElement("style");
styles.textContent = `
    wc-unhide-password-decorator {
        display: contents;

        .wc-unhide-password-decorator-button {
            position: fixed;
            right: calc(anchor(right) + 0.25rem);
            top: calc(anchor(top) + 0.25rem);
            opacity: 0.5;
            padding: 0.25rem;
            background-color: transparent;
            margin: 0;
            z-index: 2;

            &::before {
                content: "👁️";
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
        .wc-unhide-password-decorator-text {
            display: none;
            position: fixed;
            top: anchor(top);
            bottom: anchor(bottom);
            left: anchor(left);
            right: anchor(right);
            z-index: 1;
        }
        &[attached] {
            input[type='password'] {
                padding-right: 2rem;
            }
            .wc-unhide-password-decorator-button {
                right: anchor(right);
                top: anchor(top);
                bottom: anchor(bottom);
                background-color: var(--primary-medium);
                opacity: 1.0;
                border-radius: 0;
            }
            .wc-unhide-password-decorator-text {
                padding-right: 2rem;
            }
        }
        &[show] {
            .wc-unhide-password-decorator-text {
                display: block;
            }
        }
    }
`;
document.head.appendChild(styles);

export class WcUnhidePasswordDecorator extends HTMLElement {
    connectedCallback(){
        this.bind();
        this.renderDom();
        this.attachEvents();
    }
    bind(){
        this.onUnhideClick = this.onUnhideClick.bind(this);
        this.onPasswordInput = this.onPasswordInput.bind(this);
        this.onTextInput = this.onTextInput.bind(this);
    }
    renderDom(){
        this.dom = {};
        this.dom.passwordInput = this.querySelector("input[type='password']");

        if(!this.dom.passwordInput.id){
            console.warn("The decorated input element had no id. Unhide password decorator will not work.");
        }

        this.dom.unhide = document.createElement("button");
        this.dom.unhide.classList.add("wc-unhide-password-decorator-button");
        this.append(this.dom.unhide);

        this.dom.textInput = document.createElement("input");
        this.dom.id = `${this.dom.passwordInput.id}-text-input`;
        this.dom.textInput.type = "text";
        this.dom.textInput.classList.add("wc-unhide-password-decorator-text");
        this.append(this.dom.textInput);

        this.dom.passwordInput.style.anchorName = `--${this.dom.passwordInput.id}-anchor`;
        this.dom.unhide.style.positionAnchor = `--${this.dom.passwordInput.id}-anchor`;
        this.dom.textInput.style.positionAnchor = `--${this.dom.passwordInput.id}-anchor`;
    }
    attachEvents(){
        this.dom.unhide.addEventListener("click", this.onUnhideClick);
        this.dom.passwordInput.addEventListener("input", this.onPasswordInput);
        this.dom.textInput.addEventListener("input", this.onTextInput);
    }
    onUnhideClick(){
        this.toggleAttribute("show");
    }
    onPasswordInput(e){
        this.dom.textInput.value = e.target.value;
    }
    onTextInput(e){
        this.dom.passwordInput.value = e.target.value;
    }
}

customElements.define("wc-unhide-password-decorator", WcUnhidePasswordDecorator);