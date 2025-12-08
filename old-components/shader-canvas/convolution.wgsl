struct Kernel {
  height: u32,
  width: u32,
  values: array<f32>
}
struct Size {
  height: u32,
  width: u32
}
@group(0) @binding(0) var my_sampler: sampler;
@group(0) @binding(1) var my_texture: texture_2d<f32>;
@group(1) @binding(0) var<uniform> img_size: Size;
@group(1) @binding(1) var<storage, read> kernel: Kernel;
struct VertexOut {
    @builtin(position) position : vec4<f32>,
    @location(0) uv : vec2<f32>
};
@vertex
fn vertex_main(@location(0) position: vec2<f32>, @location(1) uv: vec2<f32>) -> VertexOut
{
    var output : VertexOut;
    output.position = vec4(position, 0.0, 1.0);
    output.uv = uv;
    return output;
}
@fragment
fn fragment_main(frag_data: VertexOut) -> @location(0) vec4<f32>
{
    // let kernel_size = vec2(f32(kernel.width), f32(kernel.height));
    // let kernel_mid = kernel_size - vec2(1.0,1.0) / 2.0;
    // let img_pixel_size = vec2(1.0, 1.0) / vec2(f32(img_size.height), f32(img_size.width));

    // var sum = vec3(0.0, 0.0, 0.0);
    // for(var x = 0.0; x < kernel_size.x; x += 1.0) {
    //     for(var y = 0.0; y < kernel_size.y; y += 1.0){
    //         let kernel_index = u32(x * f32(kernel.width) + y);
    //         let uv_offset = -1.0 * kernel_mid + vec2(x,y);
    //         let sample_uv = frag_data.uv + (uv_offset * img_pixel_size);
    //         let kernel_value = kernel.values[kernel_index];
    //         let sample = textureSample(my_texture, my_sampler, sample_uv);
    //         sum += sample.rgb * kernel_value;
    //     }
    // }
    // return vec4(sum, 1.0);
    return vec4(1.0, 0.0, 0.0, 1.0);
}