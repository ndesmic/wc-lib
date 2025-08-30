## Shader Canvas

This component takes an image and shader code and applies the shader to the canvas.  Child text is assumed to be the source code or the `src` attribute can be used for external files.

| prop     | js | glsl | wgsl | type       | description |
|----------|----|------|------|------------|-------------|
| image    | X  | X    | X    | string           | url to image for canvas
| height   | X  | X    | X    | number           | height to render the canvas
| width    | X  | X    | X    | number           | width to render the canvas
| globals  | X  | X    | /    | {[key: string]: any}      | collection of globals available the shader (type is inferred from array length for glsl, wgsl encodes into a buffer)
| src      | X  | X    | X    | string         | url to source for shader
| colors   |   | X     |      | [number; 4x3]  | color attribute of the edge vertices

## Convolution Canvas

This component take in convolution kernels and applies them to an image.  There are two variants `wc-js-convolution-canvas` which uses javascript (CPU) and `wc-glsl-convolution-canvas` which uses WebGL (GPU).

| prop   | js | glsl | type   | description |
|--------|----|------|------------------|-------------|
| image  | X  | X    | string           | url to image to convolute
| height | X  | X    | number           | height to render the canvas
| width  | X  | X    | number           | width to render the canvas
| shape  | X  | X    | [number; 2]  | the shape (dimensions) of the kernel (2d only)
| kernel | X  | X    | number[]         | the linear kernel data (row major)
| edges  | X  |      | ["clamp", "wrap" "mirror", "omit"; 2] | this edge behavior [X,Y], glsl canvas uses clamp