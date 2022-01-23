import manifest from '@neos-project/neos-ui-extensibility';
import onNodeChangeSendEvent from './onNodeChangeSendEvent';
import {addGuestFrameLibrary} from "./initializeJsAPI";

manifest('MhsDesign.LiveInspectorJsEvents:JsEvents', {}, globalRegistry => {
    addGuestFrameLibrary();
    const sagasRegistry = globalRegistry.get('sagas');
    sagasRegistry.set('MhsDesign.LiveInspectorJsEvents/JsEvents', {saga: onNodeChangeSendEvent});
});
