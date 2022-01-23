# MhsDesign.LiveInspectorJsEvents

## Neos Ui Plugin for Inspector change events in the iframe.

### Usage

install:
```
composer require mhsdesign/liveinspectorjsevents
```

### listen to the events (in the iframe):

```js
document.addEventListener('Neos.NodeCommit', (event) => {
    const {node, property} = event.detail;
    
    // the updated property value and also the previous.
    // {name: 'title', updated: 'abcd', previous: 'abc'}
    console.log(property);

    // see below:
    console.log(getDomElementForNode(node))
})


document.addEventListener('Neos.NodeDiscard', (event) => {
    const {node, properties} = event.detail;

    // all reset properties in a list.
    // [{name: 'title', updated: 'abc', previous: 'abcd'}]
    console.log(properties);
})
```

### A Javascript `node` object in the Neos UI looks like:
```js
node = {
    "identifier": "99257f0c-70f0-405b-a82b-fa8e375c23fb",
    "contextPath": "/sites/root/main/node-l461lxh2i1a77",
    "nodeType": "Vendor.Site:Content.Heading",
    ...
    "properties": {
        // also some private "_" properties ... like "_hidden"
        ...
        "title": "my String Old"
    }
}
```

### You can get the dom node of the corresponding node via:

> !!! Be carefully, I don't know if this is meant to be used.
> 
> Or if one would rely too much on internals.
> 
> Solution would be to export certain functions of neos-ui-guest-frame/src/dom.js to the iframe, which I decided not to do yet.

### `getDomElementForNode(node)`
```js
const getDomElementForNode = (node) => {
    const {contextPath} = node;
    // https://github.com/neos/neos-ui/blob/7ede460ec1bb8dd4455fc636b875c137d112e89d/packages/neos-ui-guest-frame/src/dom.js#L76
    return  document.querySelector(`[data-__neos-node-contextpath="${contextPath}"]`);
}
```


### More dev notes (about internals, not so much about the events above):

it sometimes helps to have the Redux DevTools installed:
https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=de

The API from the Neos UI.

```js
// the commit action (when you change a property of a node) looks like:
commitAction = {
    "type": "@neos/neos-ui/UI/Inspector/COMMIT",
    "payload": {
        "propertyId": "title",
        "value": "my String",
        ...
        "focusedNode": node, // we get something like in the node above
        }
    }
}

// when we dicard the changes, we wont know directly wich changes where made before.
discardAction = {
    "type": "@neos/neos-ui/UI/Inspector/DISCARD",
    "payload": {
        "focusedNodeContextPath": "/sites/root/main/node-l461lxh2i1a77@user-mhs"
        // we can get all the node details from the CR via:
        // selectors.CR.Nodes.nodeByContextPath(state)(focusedNodeContextPath)
    }
}

// good to know, how to alway get the current node:
const state = yield select();
const focusedNode = selectors.CR.Nodes.focusedSelector(state)

// or
const focusedNode = yield select(selectors.CR.Nodes.focusedSelector);

```
