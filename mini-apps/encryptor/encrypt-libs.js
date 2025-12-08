import { concatUint8Arrays } from "../../libs/buffer-utils.js"

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function byte(value){
    return new Uint8Array([value]);
}
/**
 * 
 * @param {BufferSource} bytes 
 * @param {string} passphrase 
 * @param {string?} hint
 * @returns 
 */
export async function encryptBytes(bytes, passphrase, hint = ""){
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const keyMaterial = await crypto.subtle.importKey(
        "raw", 
        textEncoder.encode(passphrase), 
        { name: "PBKDF2" }, 
        false, 
        ["deriveKey", "deriveBits"]
    );
    const key = await crypto.subtle.deriveKey({ 
        name: "PBKDF2", 
        salt,
        iterations: 100_000, 
        hash: "SHA-256" }, 
        keyMaterial, { name: "AES-GCM", length: 256 }, 
        false, ["encrypt"]
    );

    const cipherBytes = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        bytes
    );

    const hintBytes = textEncoder.encode(hint);
    const hintLength = byte(hintBytes.byteLength);

    return concatUint8Arrays(salt, iv, hintLength, hintBytes, new Uint8Array(cipherBytes));
}
export async function encryptText(text, passphrase, hint = ""){
    const bytes = textEncoder.encode(text);
    const payloadBytes = await encryptBytes(bytes, passphrase, hint);
    return new Uint8Array(payloadBytes).toBase64();
}

/**
 * 
 * @param {BufferSource} bytes 
 * @param {string} passphrase 
 * @returns 
 */
export async function decryptBytes(bytes, passphrase){
    bytes = new Uint8Array(bytes);
    const salt = bytes.subarray(0,16);
    const iv = bytes.subarray(16,32);
    const hintLength = bytes[32];
    const hint = textDecoder.decode(bytes.subarray(33, 33 + hintLength));
    const cipherBytes = bytes.subarray(33 + hintLength);

    try {
        const keyMaterial = await crypto.subtle.importKey(
            "raw", 
            textEncoder.encode(passphrase), 
            { name: "PBKDF2" }, 
            false, 
            ["deriveKey", "deriveBits"]
        );
        const key = await crypto.subtle.deriveKey({ 
            name: "PBKDF2", 
            salt: salt,
            iterations: 100_000, 
            hash: "SHA-256" }, 
            keyMaterial, { name: "AES-GCM", length: 256 }, 
            false, 
            ["decrypt"]
        );

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            cipherBytes
        );
        return { success: true, payload: decrypted };
    } catch(e){
        return { success: false, hint, error: e };
    }
}
export async function decryptText(text, passphrase){
    const payloadBytes = Uint8Array.fromBase64(text);
    const result = await decryptBytes(payloadBytes, passphrase);
    if(result.success){
        result.payload = textDecoder.decode(result.payload);
    }
    return result;
}