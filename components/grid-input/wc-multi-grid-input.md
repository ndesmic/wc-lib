# Wc-multi-grid-input

A list of grid inputs for 3d tensor values

## Specs

- When setting `values` as a prop, should not add to instance count (`instances` acts as a max for the view)

## TODO

- [ ] merge with grid input to make a 3-axis grid input where axes can be optional
- [ ] rows and columns
- [ ] determinism in attr parse order for correct kernel shape of initial `values` (if values call attributeChangedCallback first then shape is the default instead of the attr versions of rows and columns)