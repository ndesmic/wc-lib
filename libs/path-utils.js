export function joinPath(...parts) {
	return parts.flatMap((part, i) => {
		let normalizedPart = part;
		if (i !== 0) {
			normalizedPart = normalizedPart.replace(/^\//, "");
		}
		if (i !== parts.length - 1) {
			normalizedPart = normalizedPart.replace(/\/$/, "");
		}
		return normalizedPart.split("/");
	}).join("/");
}

export function getParentDirectory(path) {
	return path.substring(0, path.lastIndexOf("/"));
}

export function getOrigin(path) {
	return path.split("/").slice(0, 3).join("/");
}

export function resolveRelativePath(path, base) {
	if (path.startsWith("/")) {
		return path;
	}
	if (path.startsWith("..")) {
		return resolveRelativePath(path.replace(/^\.\.\/?/, ""), getParentDirectory(base));
	}
	if (path.startsWith(".")) {
		if (base.endsWith("/")) {
			return (base + path.replace(/^\.\//, ""));
		} else {
			return getParentDirectory(base) + path.replace(/^\./, "");
		}
	}
	return (base + "/" + path);
}
