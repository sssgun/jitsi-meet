import { ReducerRegistry } from '../redux';

import {
    LIB_DISPOSED,
    LIB_INIT_ERROR,
    LIB_INITIALIZED,
    SET_CONFIG
} from './actionTypes';

/**
 * The initial state of 'features/base/lib-jitsi-meet'.
 *
 * @type {{
 *     initializationError: null,
 *     initialized: boolean
 * }}
 */
const INITIAL_STATE = {
    /**
     * The mandatory configuration to be passed to JitsiMeetJS#init(). The app
     * will download config.js from the Jitsi Meet deployment and taks its
     * values into account but the values bellow will be enforced (because they
     * are essential to the correct execution of the application).
     *
     * @type {Object}
     */
    config: {
        // FIXME The support for audio levels in lib-jitsi-meet polls the
        // statistics of WebRTC at a short interval multiple times a second.
        // Unfortunately, React Native is slow to fetch these statistics from
        // the native WebRTC API, through the React Native bridge and eventually
        // to JavaScript. Because the audio levels are of no interest to the
        // mobile app, it is fastest to merely disable them.
        disableAudioLevels: true,

        // FIXME Lib-jitsi-meet uses HTML script elements to asynchronously load
        // certain pieces of JavaScript. Unfortunately, the technique doesn't
        // work on React Native (because there are no HTML elements in the first
        // place). Fortunately, these pieces of JavaScript currently involve
        // third parties and we can temporarily disable them (until we implement
        // an alternative to async script elements on React Native).
        disableThirdPartyRequests: true,
        preferH264: true
    },
    initializationError: null,
    initialized: false
};

ReducerRegistry.register(
    'features/base/lib-jitsi-meet',
    (state = INITIAL_STATE, action) => {
        switch (action.type) {
        case LIB_DISPOSED:
            return INITIAL_STATE;

        case LIB_INIT_ERROR:
            return {
                ...state,
                initializationError: action.error,
                initialized: false
            };

        case LIB_INITIALIZED:
            return {
                ...state,
                initializationError: null,
                initialized: true
            };

        case SET_CONFIG:
            return _setConfig(state, action);

        default:
            return state;
        }
    });

/**
 * Reduces a specific Redux action SET_CONFIG of the feature
 * base/lib-jitsi-meet.
 *
 * @param {Object} state - The Redux state of the feature base/lib-jitsi-meet.
 * @param {Action} action - The Redux action SET_CONFIG to reduce.
 * @private
 * @returns {Object} The new state of the feature base/lib-jitsi-meet after the
 * reduction of the specified action.
 */
function _setConfig(state, action) {
    return {
        ...state,
        config: {
            ...action.config,

            // The config of INITIAL_STATE is meant to override the config
            // downloaded from the Jitsi Meet deployment because the former
            // contains values that are mandatory.
            ...INITIAL_STATE.config
        }
    };
}
