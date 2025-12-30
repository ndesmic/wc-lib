# Wc-grid-input

A grid of inputs

## Features

- Allows adding new rows and columns

## Specs

- When `values` is set as a prop, the `Tensor` will not reshape the grid (`rows` and `columns` act like maximums for the grid)

## Inputs

### Attributes

| name | type | description | default |
|-|-|-|-|
| rows | number | the number of rows | 3
| columns | number | the number of columns | 3
| add-row | boolean | allows adding rows | false |
| add-column | boolean | allows adding columns | false |
| values | CommaDelimitedList | the values of the grid, uses `rows` and `columns` to size tensor | undefined |

### Props

| name | type | description | default |
|-|-|-|-|-|
| rows | number | the number of rows | 3 |
| columns | number | the number of columns | 3 |
| add-row | boolean | allows adding rows | false |
| add-column | boolean | allows adding columns | false |
| values | `Tensor` | the value of the grid | undefined |

## Outputs

| name | type | description | default |
|-|-|-|-|
| values | Array<any> | the value of the grid | undefined |

## Events

| name | payload |
|-|-|
| grid-input | `{ values: Array, shape: [number, number ] }` |

## TODO

- [ ] use VDOM to merge update and render
- [ ] Headers
- [x] insert rows and columns
- [ ] resize existing values on add row/col
- [ ] Copy/paste formatted values