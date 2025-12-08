customElements.define("notification-manager",
    class extends HTMLElement {
        static get observedAttributes() {
            return ["application-server-key"];
        }
        constructor() {
            super();
            this.bind(this);
            this.attrs = {};
            this.state = new Proxy({
                hasPermission: false,
                hasSubscription: false
            }, { set: this.setState });
        }
        bind(element) {
            element.setState = element.setState.bind(element);
            element.render = element.render.bind(element);
            element.enableNotifications = element.enableNotifications.bind(element);
            element.testLocalNotifications = element.testLocalNotifications.bind(element);
            element.subscribeForNotifications = element.subscribeForNotifications.bind(element);
            element.unsubscribe = element.unsubscribe.bind(element);
            element.createShadowDom = element.createShadowDom.bind(element);
            element.raiseEvent = element.raiseEvent.bind(element);
            element.camelCase = element.camelCase.bind(element);
            element.urlB64ToUint8Array = element.urlB64ToUint8Array.bind(element);
        }
        async connectedCallback() {
            this.state.isSecure = /^https|^http:\/\/localhost/.test(window.location.href);
            this.createShadowDom();
            this.cacheDom();
            this.serviceWorker = await navigator.serviceWorker.getRegistration();
            this.state.hasPermission = Notification.permission === "granted";
            this.state.hasSubscription = !!(await this.serviceWorker.pushManager.getSubscription());
            this.attachEvents();
        }
        createShadowDom() {
            const notificationDisabled = this.state.isSecure ? "" : "disabled";
            this.shadow = this.attachShadow({ mode: "closed" });
            this.shadow.innerHTML = `
			<style>
				:host { display: flex; flex-flow: row nowrap; justify-content: flex-start; align-items: center; }
                :host .test-local-notifications { border: 1px solid black; cursor: pointer; margin-left: auto; }
				:host .test-local-notifications.enabled { background: green; }
				:host .test-local-notifications.disabled { background: red; }
				:host .test-local-notifications.not-subscribed { background: yellow; }
			</style>
            <label>
                <input class="enable" type="checkbox" ${notificationDisabled} />
                <span>Enable Notifications</span>
            </label>
			<button class="test-local-notifications">Test</button>
		`;
        }
        cacheDom() {
            this.dom = {};
            this.dom.testLocalNotifications = this.shadow.querySelector(".test-local-notifications");
            this.dom.enable = this.shadow.querySelector(".enable");
        }
        attachEvents() {
            this.dom.testLocalNotifications.addEventListener("click", this.testLocalNotifications);
            this.dom.enable.addEventListener("click", this.enableNotifications);
        }
        setState(target, key, value) {
            if (target[key] !== value) {
                requestAnimationFrame(this.render);
            }
            return Reflect.set(target, key, value);
        }
        testLocalNotifications() {
            this.serviceWorker.showNotification("hello!");
        }
        render() {
            const notificationStatus = this.state.hasPermission ? this.state.hasSubscription ? "enabled" : "not-subscribed" : "disabled";
            ["enabled", "not-subscribed", "disabled"].forEach(c => this.dom.testLocalNotifications.classList.toggle(c, c === notificationStatus));
            this.dom.enable.checked = this.state.hasPermission && this.state.hasSubscription;
        }
        async enableNotifications(e) {
            e.preventDefault();
            this.state.hasPermission = (await Notification.requestPermission()) === "granted";
            if(!hasSubscription){
                await this.subscribeForNotifications();
            } else {
                await this.unsubscribe();
            }
        }
        async subscribeForNotifications() {
            try {
                const subscription = await this.serviceWorker.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.applicationServerKey
                });
                this.state.hasSubscription = true;
                this.raiseEvent("gotsubscription", result);
            } catch (ex) {
                this.state.hasSubscription = false;
                console.error("Failed to register for push notifications", ex);
            }
        }
        async unsubscribe(){
            try {
                const unsubscribed = await this.serviceWorker.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.applicationServerKey
                });
                this.state.hasSubscription = false;
                this.raiseEvent("unsubscribed");
            } catch (ex) {
                console.error("Failed to unregister for push notifications", ex);
            }
        }
        raiseEvent(eventName, payload){
            const event = document.createEvent("HTMLEvents");
            event.initEvent(eventName, true, true);
            event.data = payload;
            this.dispatchEvent(event);
        }
        camelCase(text) {
            return text.replace(/-([a-z])/g, g => g[1].toUpperCase());
        }
        urlB64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }
        attributeChangedCallback(name, oldValue, newValue) {
            this[this.camelCase(name)] = newValue;
        }
        set applicationServerKey(value) {
            this.attrs.applicationServerKey = this.urlB64ToUint8Array(value);
        }
        get applicationServerKey() {
            return this.attrs.applicationServerKey || new Uint8Array();
        }
    });
