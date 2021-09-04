# MhsDesign.LiveInspectorJsEvents

## Neos Ui Plugin for Inspector change events in the iframe.

### Usage

listen to the events (in the iframe):

```js
document.addEventListener("MhsDesign.LiveInspectorJsEvents", (event) => {
    const crNode = event.detail.node

    // fresh properties as key value object

    // on discard all properties will be in this object.
    // except the ones starting with an underscore (private)
    const properties = event.detail.properties

    // COMMIT or DISCARD
    const typeOfUserAction = event.detail.message
})
```
