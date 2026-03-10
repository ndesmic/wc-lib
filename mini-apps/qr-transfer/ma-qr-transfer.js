export class MaQrTransfer extends HTMLElement {
    #barcodeDetector;
    #barcodesFound = new Set();
    #barcodePollInterval;
    
    connectedCallback(){
        this.bind();
        this.registerDom();
        this.attachEvents();
        this.init();
    }
    bind(){
        this.onQrInput = this.onQrInput.bind(this);
        this.onDetectBarcode = this.onDetectBarcode.bind(this);
        this.onTabChanged = this.onTabChanged.bind(this);
    }
    init(){
        if("BarcodeDetector" in globalThis){
            this.#barcodeDetector = new BarcodeDetector({
                formats: ["qr_code"]
            });
        } else {
            this.dom.receiveContent.innerHTML = `<div class="card warn">Barcode Detector not supported on this device</div>`;
        }
    }
    registerDom(){
        this.dom = {
            tabPanel: this.querySelector("wc-tab-panel"),
            qrInput: this.querySelector(".qr-value"),
            qrCode: this.querySelector("wc-qr-code"),
            cameraPreview: this.querySelector(".camera-preview"),
            barcodeValues: this.querySelector(".barcode-values"),
            receiveContent: this.querySelector(".receive-content")
        };
    }
    attachEvents(){
        this.dom.qrInput.addEventListener("input", this.onQrInput);
        this.dom.tabPanel.addEventListener("tab-changed", this.onTabChanged);
    }
    onTabChanged(e){
        const index = e.detail.index;
        if(index === 1){
            this.#barcodePollInterval = setInterval(this.onDetectBarcode, 1000);
        } else {
            clearInterval(this.#barcodePollInterval);
        }
    }
    onQrInput(e){
        this.dom.qrCode.value = e.target.value;
    }
    async onDetectBarcode(){
        if(this.#barcodeDetector){
            const barcodes = await this.#barcodeDetector.detect(image);
            for(const barcode of barcodes){
                if(!this.#barcodesFound.has(barcode.rawValue)){
                    this.#barcodesFound.add(barcode.rawValue);
                    const li = document.createElement("li");
                    li.textContent(barcode.rawValue);
                    this.dom.barcodeValues.append(li);
                }
            }
        }
    }
}

customElements.define("ma-qr-transfer", MaQrTransfer);