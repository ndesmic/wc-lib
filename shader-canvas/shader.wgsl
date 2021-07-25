[[block]]
struct Uniforms {
    foo: f32;
};
[[group(0), binding(0)]] var my_sampler: sampler;
[[group(0), binding(1)]] var my_texture: texture_2d<f32>;
[[group(1), binding(0)]] var<uniform> my_uniform: Uniforms;
struct VertexOut {
    [[builtin(position)]] position : vec4<f32>;
    [[location(0)]] uv : vec2<f32>;
};

[[stage(vertex)]]
fn vertex_main([[location(0)]] position: vec2<f32>, [[location(1)]] uv: vec2<f32>) -> VertexOut
{
    var output : VertexOut;
    output.position = vec4<f32>(position, 0.0, 1.0);
    output.uv = uv;
    return output;
}

[[stage(fragment)]]
fn fragment_main(fragData: VertexOut) -> [[location(0)]] vec4<f32>
{
    var achromatopsia = mat4x4<f32>(
        vec4<f32>(0.21, 0.21, 0.21, 0.0),
        vec4<f32>(0.72, 0.72, 0.72, 0.0),
        vec4<f32>(0.07, 0.07, 0.07, 0.0),
        vec4<f32>(0.0, 0.0, 0.0, 1.0),
    );

    return achromatopsia * textureSample(my_texture, my_sampler, fragData.uv);
}