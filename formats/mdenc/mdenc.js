const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const vectorSize = 16;
const saltSize = 16;
const iterations = 210_000;

/**
 * @param {string} password
 * @returns
 */
async function deriveKey(password, salt) {
	const buffer = textEncoder.encode(password);
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		buffer,
		{ name: "PBKDF2" },
		false,
		["deriveKey"],
	);
	const key = crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			hash: { name: "SHA-512" },
			iterations,
			salt,
		},
		keyMaterial,
		{
			name: "AES-GCM",
			length: 256,
		},
		false,
		["encrypt", "decrypt"],
	);

	return key;
}

/**
 * Works for version of obsidian meld
 * @param {BufferSource} bytes
 * @param {string} passphrase
 * @returns
 */
export async function decryptBytes(bytes, passphrase) {
	const json = textDecoder.decode(bytes);
	const data = JSON.parse(json);
	const hint = data.hint;
	const bytesToDecode = Uint8Array.fromBase64(data.encodedData);

	let i = 0;
	const iv = bytesToDecode.slice(0, vectorSize);
	i += vectorSize;
	const salt = bytesToDecode.slice(i, i + saltSize);
	i += saltSize;
	const cipherBytes = bytesToDecode.slice(i);

	try {
		const key = await deriveKey(passphrase, salt);
		const decrypted = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			key,
			cipherBytes,
		);

		return { success: true, payload: decrypted };
	} catch (e) {
		return { success: false, hint, error: e };
	}
}

//---
	function stringToArray(str) {
		const result = [];
		for (let i = 0; i < str.length; i++) {
			result.push(str.charCodeAt(i));
		}
		return new Uint8Array(result);
	}

async function deriveKey2(password) {
	const buffer = textEncoder.encode(password);
	const key = await crypto.subtle.importKey(
		"raw",
		buffer,
		{ name: "PBKDF2" },
		false,
		["deriveKey"],
	);
	const privateKey = crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			hash: { name: "SHA-256" },
			iterations,
			salt,
		},
		key,
		{
			name: "AES-GCM",
			length: 256,
		},
		false,
		["encrypt", "decrypt"],
	);

	return privateKey;
}

async function decryptFromBytes(encryptedBytes, password) {
		try {

			// extract iv
			const vector = encryptedBytes.slice(0,vectorSize);

			// extract encrypted text
			const encryptedTextBytes = encryptedBytes.slice(vectorSize);

			const key = await deriveKey2(password);

			// decrypt into bytes
			const decryptedBytes = await crypto.subtle.decrypt(
				{name: 'AES-GCM', iv: vector},
				key,
				encryptedTextBytes
			);

			// convert bytes to text
			const decryptedText = utf8Decoder.decode(decryptedBytes);
			return decryptedText;
		} catch (e) {
			//console.error(e);
			return null;
		}
	}

	async function decryptFromBase64(base64Encoded, password) {
		try {

			const bytesToDecode = stringToArray(atob(base64Encoded));
			
			return await decryptFromBytes(bytesToDecode, password);

			// // extract iv
			// const vector = bytesToDecode.slice(0,vectorSize);

			// // extract encrypted text
			// const encryptedTextBytes = bytesToDecode.slice(vectorSize);

			// const key = await this.deriveKey(password);

			// // decrypt into bytes
			// let decryptedBytes = await crypto.subtle.decrypt(
			// 	{name: 'AES-GCM', iv: vector},
			// 	key,
			// 	encryptedTextBytes
			// );

			// // convert bytes to text
			// let decryptedText = utf8Decoder.decode(decryptedBytes);
			// return decryptedText;
		} catch (e) {
			//console.error(e);
			return null;
		}
	}
