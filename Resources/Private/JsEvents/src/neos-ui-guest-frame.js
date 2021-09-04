/*
same functions as in '@neos-project/neos-ui-guest-frame/src/dom' but these files are not yet exposed
but will be soon: https://github.com/neos/neos-ui/pull/2945
*/

const getGuestFrameDocument = () => {
    const guestFrame = document.getElementsByName('neos-content-main')[0];
    return guestFrame && guestFrame.contentDocument;
};

export const dispatchCustomEvent = (eventName, eventDescription, eventDetail = {}) => {
    const detail = {
        message: eventDescription,
        ...eventDetail
    };
    const event = new CustomEvent(
        eventName,
        {
            detail,
            bubbles: true,
            cancelable: true
        }
    );
    getGuestFrameDocument().dispatchEvent(event);
};
