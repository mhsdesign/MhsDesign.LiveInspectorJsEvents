import {takeLatest} from 'redux-saga/effects'
import {actionTypes, selectors} from '@neos-project/neos-ui-redux-store'
// https://github.com/neos/neos-ui/blob/7ede460ec1bb8dd4455fc636b875c137d112e89d/packages/neos-ui-guest-frame/src/dom.js#L313
import {dispatchCustomEvent} from '@neos-project/neos-ui-guest-frame'

// cache of all pending changes of the current edited node.
// will be updated on commit event - and flushed on discard.
// https://github.com/neos/neos-ui/blob/7ede460ec1bb8dd4455fc636b875c137d112e89d/packages/neos-ui-redux-store/src/UI/Inspector/selectors.ts#L15
// https://github.com/neos/neos-ui/blob/7ede460ec1bb8dd4455fc636b875c137d112e89d/packages/neos-ui-redux-store/src/UI/Inspector/index.ts#L91
let lastTransientValues = {};

export default function* onNodeChangeSendEvent({store}) {

    // COMMIT happens on every subtle change in the inspector. (sometimes even when the previousValue === newValue)
    yield takeLatest(actionTypes.UI.Inspector.COMMIT, function* (action) {
        const {focusedNode, propertyId, value} = action.payload;

        const previousValue = typeof lastTransientValues[propertyId] !== "undefined"
            ? lastTransientValues[propertyId].value
            : focusedNode.properties[propertyId]

        if (previousValue === value) {
            // does happen
            // fx. when re-selecting the same option from a select box
            return
        }

        const updatedProperty = {
            name: propertyId,
            updated: value,
            previous: previousValue
        }

        dispatchCustomEvent('Neos.NodeCommit', 'New property value of node was committed.', {
            node: focusedNode,
            property: updatedProperty
        })

        // update cache
        const state = store.getState();
        lastTransientValues = selectors.UI.Inspector.transientValues(state);
    })

    // DISCARD happens when you dont apply the changes.
    yield takeLatest(actionTypes.UI.Inspector.DISCARD, function* (action) {
        const {focusedNodeContextPath} = action.payload;

        const state = store.getState();
        const focusedNode = selectors.CR.Nodes.nodeByContextPath(state)(focusedNodeContextPath)

        const updatedProperties = Object.entries(lastTransientValues).map(([propertyIdToBeReset, propertyUnchangedValueToBeReset]) => {
            return {
                name: propertyIdToBeReset,
                updated: focusedNode.properties[propertyIdToBeReset],
                previous: propertyUnchangedValueToBeReset.value
            }
        })
        // flush cache
        lastTransientValues = {};

        dispatchCustomEvent('Neos.NodeDiscard', 'Previously changed properties of node were reset.', {
            node: focusedNode,
            properties: updatedProperties
        })
    })
}
