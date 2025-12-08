# Text Box

An enhanced text input that allows drag and drop of text files as well as the ability to persist data across sessions.

## Attributes

### storage-key

The id in the storage you want to use to save the data (should be unique per url)

### storage-type

`local-storage` or `web-extension`.  `local-storage` is exactly that, `web-extension` uses `chrome.storage.local` and used for extensions.

### placeholder

Same as placeholder for inputs

### value

Same as value for inputs.  If set on the element it acts as a default if there is not stored value (which includes empty string)

## Events

## Style Hooks