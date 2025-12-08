import { IdbStorage } from "../../libs/idb-storage.js";
import { decryptBytes, encryptBytes } from "./encrypt-libs.js";

export class MaDecryptFileSystem extends HTMLElement {
    /**@type {IdbStorage} */
    #idb;
    #handle;

    async connectedCallback(){
        this.bind(this);
        this.registerDom();
        this.attachEvents();
        this.#idb = new IdbStorage();
        this.#handle = await this.#idb.get("encryptor-fs-handle");
        if(this.#handle){
            await customElements.whenDefined("wc-directory-listing");
            this.dom.directoryListing.show(this.#handle);
        }
    }
    bind(){
        this.onPickerClicked = this.onPickerClicked.bind(this);
        this.onEntriesSelected = this.onEntriesSelected.bind(this);
        this.onEncryptClicked = this.onEncryptClicked.bind(this);
        this.onDecryptClicked = this.onDecryptClicked.bind(this);
        this.onDeleteClicked = this.onDeleteClicked.bind(this);
    }
    registerDom(){
        this.dom = {
            passphrase: this.querySelector(".decrypt-file-system-passphrase"),
            hint: this.querySelector(".decrypt-file-system-passphrase-hint"),
            picker: this.querySelector(".decrypt-file-system-picker"),
            encryptButton: this.querySelector(".encrypt-file-button"),
            decryptButton: this.querySelector(".decrypt-file-button"),
            deleteButton: this.querySelector(".delete-file-button"),
            directoryListing: this.querySelector("wc-directory-listing"),
            filePreview: this.querySelector("wc-file-preview"),
            output: this.querySelector(".decrypt-fs-output")
        };
    }
    attachEvents(){
       this.dom.picker.addEventListener("click", this.onPickerClicked);
       this.dom.directoryListing.addEventListener("entries-selected", this.onEntriesSelected);
       this.dom.encryptButton.addEventListener("click", this.onEncryptClicked);
       this.dom.decryptButton.addEventListener("click", this.onDecryptClicked);
       this.dom.deleteButton.addEventListener("click", this.onDeleteClicked);
    }
    clearStatus(){
        this.dom.output.classList.remove("error", "warn", "info", "success");
        this.dom.output.textContent = "";
    }
    writeStatus(level, text){
        this.clearStatus();
        
        this.dom.output.classList.add(level);
        this.dom.output.value = text;
    }
    async onPickerClicked(){
        this.#handle = await showDirectoryPicker();
        await this.#idb.set("encryptor-fs-handle", this.#handle);
        this.dom.directoryListing.show(this.#handle);
    }
    async onEntriesSelected(e){
        const files = await Promise.all(e.detail.entries.map(e => e.getFile()));
        const unencryptedFiles = await Promise.all(files.map(async f => {
            if(f.name.endsWith(".crypt")){
                const arrayBuffer = await f.arrayBuffer();
                const passphrase = this.dom.passphrase.value;
                const result = await decryptBytes(arrayBuffer, passphrase);
                if(!result.success){
                    this.writeStatus("warn", `Hint: ${result.hint}`)
                } else {
                    this.clearStatus();
                    const blob = new Blob([result.payload], { type: "application/octet-stream" });
                    blob.name = f.name.split(".").slice(0,-1).join(".");
                    return blob;
                }
            }
            return f;
        }));
        this.dom.filePreview.show(unencryptedFiles);
    }
    async onEncryptClicked(){
        if(!this.dom.passphrase.value.trim()){
            this.writeStatus("error", `No passphrase provided.`);
            return;
        }

        const entries = this.dom.directoryListing.selectedEntries;

        if(entries.length === 0){
            this.writeStatus("error", "No file selected");
            return;
        }

        this.clearStatus();
        const unencryptedFiles = await Promise.all(entries.filter(e => {
            return !e.name.endsWith(".crypt");
        }).map(e => e.getFile()));

        for(const file of unencryptedFiles){
            try {
                const passphrase = this.dom.passphrase.value;
                const hint = this.dom.hint.value;
                const arrayBuffer = await file.arrayBuffer();
                const encryptedBytes = await encryptBytes(arrayBuffer, passphrase, hint);

                const fileHandle = await this.#handle.getFileHandle(`${file.name}.crypt`, { create: true });
                const perm = await fileHandle.queryPermission({ mode: "readwrite" });
                if (perm === "granted") {
                    const writable = await fileHandle.createWritable();
                    await writable.write(encryptedBytes);
                    await writable.close();
                } else {
                    this.writeStatus("error", "Permission not granted");
                }
            } catch(e){
                this.writeStatus("error", e.message);
            }
        }

        this.dom.directoryListing.show(this.#handle);
    }
    async onDecryptClicked(){
        if(!this.dom.passphrase.value.trim()){
            this.writeStatus("error", `No passphrase provided.`);
            return;
        }

        const entries = this.dom.directoryListing.selectedEntries;

        if(entries.length === 0){
            this.writeStatus("error", "No file selected");
            return;
        }

        this.clearStatus();
        const encryptedFiles = await Promise.all(entries.filter(e => {
            return e.name.endsWith(".crypt");
        }).map(e => e.getFile()));

        for(const file of encryptedFiles){
            try {
                const passphrase = this.dom.passphrase.value;
                const arrayBuffer = await file.arrayBuffer();
                const decryptedBytes = await decryptBytes(arrayBuffer, passphrase);
                if(!decryptedBytes.success){
                    throw new Error(`Could not decrypt file. Hint: ${decryptedBytes.hint}`);
                }
                const newName = file.name.split(".").slice(0, -1).join(".");

                const fileHandle = await this.#handle.getFileHandle(newName, { create: true });
                const perm = await fileHandle.queryPermission({ mode: "readwrite" });
                if (perm === "granted") {
                    const writable = await fileHandle.createWritable();
                    await writable.write(decryptedBytes.payload);
                    await writable.close();
                } else {
                    this.writeStatus("error", "Permission not granted");
                }
            } catch(e){
                this.writeStatus("error", e.message);
            }
        }

        this.dom.directoryListing.show(this.#handle);
    }
    async onDeleteClicked(){
        const entries = this.dom.directoryListing.selectedEntries;
        if(entries.length === 0){
            this.writeStatus("error", "No files selected.");
            return;
        }

        const isOk = globalThis.confirm(`${entries.length} file(s) will be deleted.  Is this okay?`);

        if(!isOk){
            return;
        }

        try {
            for(const entry of entries){
                await this.#handle.removeEntry(entry.name);
            }
            this.writeStatus("success", `${entries.length} files deleted!`);
        } catch(e){
            this.writeStatus("error", e.message);
        }

        this.dom.directoryListing.show(this.#handle);
    }
}

customElements.define("ma-decrypt-file-system", MaDecryptFileSystem);