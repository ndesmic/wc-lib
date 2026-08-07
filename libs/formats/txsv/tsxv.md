# TSXV (Typed X seperated values)

A super-set of csv/tsv with configurable delimiters and support for manual column types or columns headers.
Headers can be in the format `name: type` where `type` can be `int`, `float`, `string`, `date`.  This is parsable even by libraries that don't support types.

Output formats include Tuples which are arrays of arrays, Records which are objects where the objects have named properties based on column data or Tensors which ignore column data and require that all values are numbers and supports `i32`, `i16`, `i8`, `u32`, `u16`, `u8`, `f64`, `f32` as backing types.
