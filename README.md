# MhsDesign.LiveInspectorJsEvents

## Neos Ui Plugin for Inspector change events in the iframe.

### Demo 
https://user-images.githubusercontent.com/85400359/150694045-375e3e79-0a9e-4d92-864e-f873a053b1a4.mp4

### Install
```
composer require "mhsdesign/liveinspectorjsevents:~2.0.0"
```
<a name="tutorial"></a>
# Tutorial for a self made implementation:
## Change the class of a spacer to its property value:

your yaml:
<details>
<summary>A basic (standalone) nodeType yaml config with a select box</summary>


```yaml
'MhsDesign.LiveInspectorDemo:Content.Spacer':
  superTypes:
    'Neos.Neos:Content': true
  ui:
    icon: 'icon-internet-explorer'
    label: 'Example'
    # this will remove the Neos not inline editable overlay.
    inlineEditable: true
    inspector:
    groups:
      settings:
      label: 'Settings'
  properties:
    height:
    type: string
    ui:
      # not need to explicitly state it since its the default:
      # reloadIfChanged: false
      label: 'Height'
      inspector:
      group: settings
      editor: 'Neos.Neos/Inspector/Editors/SelectBoxEditor'
      editorOptions:
        allowEmpty: true
        values:
          # your css classes as key.
          height-sm:
            label: 'Small'
          height-md:
            label: 'Medium'
          height-lg:
            label: 'Large'
```

</details>

your fusion:
```
prototype(MhsDesign.LiveInspectorDemo:Content.Spacer) < prototype(Neos.Neos:ContentComponent) {
    height = ${q(node).property('height')}
    renderer = afx`
        <div class={['spacer', props.height]}></div>
    `
}
```

your js:
```js
// all changers will be registered here:
const changer = {}
changer['MhsDesign.LiveInspectorDemo:Content.Spacer'] = (node, property) => {
    const {name, updated, previous} = property;
    /** type HTMLElement */
    const el = neos.guestFrame.findElementByNode(node);
    switch (name) {
        case 'height':
            // sometimes the ui wraps an div around the html - sometimes not.
            const spacerDiv = querySelectClosest(el, '.spacer')
            if (previous !== '') {
                spacerDiv.classList.remove(previous)
            }
            if (updated !== '') {
                spacerDiv.classList.add(updated)
            }
    }
}

// call the changer defined for a node by nodeType
const updateNode = (node, property) => {
    if (typeof changer[node.nodeType] !== "undefined") {
        changer[node.nodeType](node, property);
    }
    // alternative:
    // switch (node.nodeType) {
    //     case 'MhsDesign.LiveInspectorDemo:Content.Spacer':
    //         changeSpacer(node, property)
    // }
}

// register to the events
document.addEventListener('Neos.NodeCommit', (event) => {
    const {node, property} = event.detail;
    updateNode(node, property)
})

document.addEventListener('Neos.NodeDiscard', (event) => {
    const {node, properties} = event.detail;
    properties.forEach(property => {
        updateNode(node, property)
    })
})

// helper
const querySelectClosest = (element, selector) => {
    if (element.matches(selector)) {
        return element;
    }
    return element.querySelector(selector)
}
```

--------

# Usage

### listen to the events (in the iframe):

```js
document.addEventListener('Neos.NodeCommit', (event) => {
    const {node, property} = event.detail;
    
    // the updated property value and also the previous.
    // {name: 'title', updated: 'abcd', previous: 'abc'}
    console.log(property);

    // experimental: see below:
    console.log(neos.guestFrame.findElementByNode(node));
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

### Get the dom element of the corresponding node:

> The following functionality or way of handling this is experimental, and could eventually change.

the global `window.neos` object is extended by this package and exposes under `guestFrame` this function, which makes it possible to get the dom element by node object:
```js
neos.guestFrame.findElementByNode(node)
```


Under the hood it does something like:
(*But try to avoid using the following snippet directly as it uses eventually purely internal knowledge.*)

```js
const findElementByNode = (node) => {
    const {contextPath} = node;
    // https://github.com/neos/neos-ui/blob/7ede460ec1bb8dd4455fc636b875c137d112e89d/packages/neos-ui-guest-frame/src/dom.js#L76
    return  document.querySelector(`[data-__neos-node-contextpath="${contextPath}"]`);
}
```

--------

# Internals
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
