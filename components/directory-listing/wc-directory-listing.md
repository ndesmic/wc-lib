# Wc-directory-listing

Previews a list of files

## Features

- drag select
- ctrl select
- shift select

## Specs

- When no item selected and item clicked it should select it
- When items selected and item click it should replace selection with new item
- When no item selected and item ctrl clicked it should select it
- When items selected and new item ctrl clicked it should add to selection
- When items selected and selected item crtl clicked is should remove from selection
- When no item selected and item shift clicked it should select from first item to the clicked item
- When items selected and item shift clicked it should select from the last clicked item to the clicked item

## TODO

- [x] shift click
- [ ] directory navigation
- [x] file icons
- [ ] selection while scrolling
    - This will likely need to remove the bounding box caching because the elements can move during drag
- [ ] Grid