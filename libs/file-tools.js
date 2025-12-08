const images = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"];
const text = ["txt"];
const video = ["mp4", "webm"];
const audio = ["mp3", "m4a"];
const compressed = ["zip", "rar"];
const archive = ["tar"];

export function classifyFileType(ext, customTypes = []) {
	if (images.includes(ext)) {
		return "image";
	} else if (text.includes(ext)) {
		return "text";
	} else if (video.includes(ext)) {
		return "video";
	} else if (audio.includes(ext)) {
		return "audio";
	} else if (compressed.includes(ext)) {
		return "compressed";
	} else if (archive.includes(ext)) {
		return "archive";
	}
    for(const [typeExts, type] of customTypes){
        if(typeExts.includes(ext)){
            return type;
        }
    }
    return "generic";
}
