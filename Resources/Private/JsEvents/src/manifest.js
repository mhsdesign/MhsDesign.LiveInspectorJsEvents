import manifest from '@neos-project/neos-ui-extensibility';
import onNodeChangeSendEvent from './onNodeChangeSendEvent'

manifest('MhsDesign.LiveInspectorJsEvents:JsEvents', {}, globalRegistry => {
    const sagasRegistry = globalRegistry.get('sagas');
    sagasRegistry.set('MhsDesign.LiveInspectorJsEvents/JsEvents', {saga: onNodeChangeSendEvent});
});
