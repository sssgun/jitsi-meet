import { CONFERENCE_FAILED } from '../base/conference';
import {
    CONNECTION_ESTABLISHED,
    CONNECTION_FAILED
} from '../base/connection';
import JitsiMeetJS, {
    isFatalJitsiConnectionError
} from '../base/lib-jitsi-meet';
import {
    ReducerRegistry,
    setStateProperties,
    setStateProperty
} from '../base/redux';

import {
    MEDIA_PERMISSION_PROMPT_VISIBILITY_CHANGED,
    SUSPEND_DETECTED
} from './actionTypes';

const JitsiConferenceErrors = JitsiMeetJS.errors.conference;
const JitsiConnectionErrors = JitsiMeetJS.errors.connection;
const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 * Reduces the Redux actions of the feature overlay.
 */
ReducerRegistry.register('features/overlay', (state = {}, action) => {
    switch (action.type) {
    case CONFERENCE_FAILED:
        return _conferenceFailed(state, action);

    case CONNECTION_ESTABLISHED:
        return _connectionEstablished(state, action);

    case CONNECTION_FAILED:
        return _connectionFailed(state, action);

    case MEDIA_PERMISSION_PROMPT_VISIBILITY_CHANGED:
        return _mediaPermissionPromptVisibilityChanged(state, action);

    case SUSPEND_DETECTED:
        return _suspendDetected(state, action);
    }

    return state;
});

/**
 * Reduces a specific Redux action CONFERENCE_FAILED of the feature overlay.
 *
 * @param {Object} state - The Redux state of the feature overlay.
 * @param {Action} action - The Redux action CONFERENCE_FAILED to reduce.
 * @returns {Object} The new state of the feature overlay after the reduction of
 * the specified action.
 * @private
 */
function _conferenceFailed(state, action) {
    const error = action.error;

    if (error === JitsiConferenceErrors.FOCUS_LEFT
            || error === JitsiConferenceErrors.VIDEOBRIDGE_NOT_AVAILABLE) {
        return setStateProperties(state, {
            haveToReload: true,
            isNetworkFailure: false,
            reason: action.errorMessage
        });
    }

    return state;
}

/**
 * Reduces a specific Redux action CONNECTION_ESTABLISHED of the feature
 * overlay.
 *
 * @param {Object} state - The Redux state of the feature overlay.
 * @returns {Object} The new state of the feature overlay after the reduction of
 * the specified action.
 * @private
 */
function _connectionEstablished(state) {
    return setStateProperty(state, 'connectionEstablished', true);
}

/**
 * Reduces a specific Redux action CONNECTION_FAILED of the feature overlay.
 *
 * @param {Object} state - The Redux state of the feature overlay.
 * @param {Action} action - The Redux action CONNECTION_FAILED to reduce.
 * @returns {Object} The new state of the feature overlay after the reduction of
 * the specified action.
 * @private
 */
function _connectionFailed(state, action) {
    const error = action.error;

    if (isFatalJitsiConnectionError(error)) {
        const errorMessage = action.errorMessage;

        logger.error(`XMPP connection error: ${errorMessage}`);

        return setStateProperties(state, {
            haveToReload: true,


            // From all of the cases above only CONNECTION_DROPPED_ERROR is
            // considered a network type of failure.
            isNetworkFailure:
                error === JitsiConnectionErrors.CONNECTION_DROPPED_ERROR,
            reason: `xmpp-conn-dropped: ${errorMessage}`
        });
    }

    return state;
}

/**
 * Reduces a specific Redux action MEDIA_PERMISSION_PROMPT_VISIBILITY_CHANGED of
 * the feature overlay.
 *
 * @param {Object} state - The Redux state of the feature overlay.
 * @param {Action} action - The Redux action to reduce.
 * @returns {Object} The new state of the feature overlay after the reduction of
 * the specified action.
 * @private
 */
function _mediaPermissionPromptVisibilityChanged(state, action) {
    return setStateProperties(state, {
        browser: action.browser,
        isMediaPermissionPromptVisible: action.isVisible
    });
}

/**
 * Reduces a specific Redux action SUSPEND_DETECTED of the feature overlay.
 *
 * @param {Object} state - The Redux state of the feature overlay.
 * @returns {Object} The new state of the feature overlay after the reduction of
 * the specified action.
 * @private
 */
function _suspendDetected(state) {
    return setStateProperty(state, 'suspendDetected', true);
}
