// https://github.com/neos/neos-ui/blob/7ede460ec1bb8dd4455fc636b875c137d112e89d/packages/neos-ui-guest-frame/src/dom.js#L76
import {findNodeInGuestFrame } from '@neos-project/neos-ui-guest-frame'

// use it like neos.guestFrame.findElementByNode(node)
export const addGuestFrameLibrary = () => {
    if (window.neos === undefined) {
        throw new Error(`Could not add library to Neos API, because 'window.neos' is not defined.`);
    }

    const alias = 'guestFrame';
    if (window.neos[alias] !== undefined) {
        throw new Error(`Could not initialize API, because ${alias} is already defined.`);
    }
    window.neos[alias] = {
        findElementByNode: (node) => {
            const {contextPath} = node;
            return findNodeInGuestFrame(contextPath);
        }
    }
}
