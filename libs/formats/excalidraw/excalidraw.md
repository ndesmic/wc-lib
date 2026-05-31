# Excalidraw

Supports converting the excalidraw JSON format to SVG

## Supported element types and features

| Feature   | Supported |
| --------- | --------- |
| Rectangle |✔			|
| Ellipse	| ✔			|
| Text 		|	✔		|
| Line		|	✔		|
| Arrow		|	✔		|


## Bugs

- Text doesn't center due to stale coordinates
	- If text contains containerId that points to a line then it must be centered manually