import {takeLatest, select} from 'redux-saga/effects'
import {actionTypes, selectors} from '@neos-project/neos-ui-redux-store'

import {filterOutPropertiesWithUnderscore} from './helpers'
// TODO: use consumer api soon: https://github.com/neos/neos-ui/pull/2945
import {dispatchCustomEvent} from './neos-ui-guest-frame'

export default function* onNodeChangeSendEvent() {

    // COMMIT happens on every subtle change in the inspector.
    yield takeLatest(actionTypes.UI.Inspector.COMMIT, function* (action) {

        // alternative
        // const state = yield select();
        // const node = selectors.CR.Nodes.focusedSelector(state)

        const node = action.payload.focusedNode

        const changedNodeProperty = {}
        changedNodeProperty[action.payload.propertyId] = action.payload.value

        dispatchCustomEvent('MhsDesign.LiveInspectorJsEvents', 'COMMIT', {
            node: node,
            properties: changedNodeProperty
        })
    })

    // DISCARD happens when you dont apply the changes.
    yield takeLatest(actionTypes.UI.Inspector.DISCARD, function* (action) {

        const state = yield select();
        const node = selectors.CR.Nodes.nodeByContextPath(state)(action.payload.focusedNodeContextPath)

        dispatchCustomEvent('MhsDesign.LiveInspectorJsEvents', 'DISCARD', {
            node: node,
            properties: filterOutPropertiesWithUnderscore(node.properties)
        })
    })
}


/*

make sure you have the Redux DevTools installed:
https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=de

The API from Neos.

node = {
    "identifier": "99257f0c-70f0-405b-a82b-fa8e375c23fb",
    ...
    "properties": {
        "_creationDateTime": "2021-08-22T18:58:21+00:00",
        "_path": "/sites/root/main/node-l461lxh2i1a77",
        "_name": "node-l461lxh2i1a77",
        "_nodeType": "Vendor.Site:Content.Heading",
        ...
        "title": "my String old"
}

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

discardAction = {
    "type": "@neos/neos-ui/UI/Inspector/DISCARD",
    "payload": {
        "focusedNodeContextPath": "/sites/root/main/node-l461lxh2i1a77@user-mhs"
        // we can get all the node details from the CR via:
        // selectors.CR.Nodes.nodeByContextPath(state)(focusedNodeContextPath)
    }
}

*/
