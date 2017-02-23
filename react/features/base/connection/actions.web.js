/* @flow */

import type { Dispatch } from 'redux';

import UIEvents from '../../../../service/UI/UIEvents';

import { SET_DOMAIN } from './actionTypes';

import { appNavigate } from '../../app';
import { setUnsupportedBrowser } from '../../unsupported-browser';

declare var APP: Object;
declare var JitsiMeetJS: Object;
declare var config: Object;

const JitsiConferenceEvents = JitsiMeetJS.events.conference;
const logger = require('jitsi-meet-logger').getLogger(__filename);

export {
    connectionEstablished,
    connectionFailed
} from './actions.native.js';

/**
 * Opens new connection.
 *
 * @returns {Promise<JitsiConnection>}
 */
export function connect() {
    return (dispatch: Dispatch<*>, getState: Function) => {
        const state = getState();

        // XXX Lib-jitsi-meet does not accept uppercase letters.
        const room = state['features/base/conference'].room.toLowerCase();

        // XXX For web based version we use conference initialization logic
        // from the old app (at the moment of writing).
        return APP.conference.init({ roomName: room }).then(() => {
            if (APP.logCollector) {
                // Start the LogCollector's periodic "store logs" task
                APP.logCollector.start();
                APP.logCollectorStarted = true;

                // Make an attempt to flush in case a lot of logs have been
                // cached, before the collector was started.
                APP.logCollector.flush();

                // This event listener will flush the logs, before
                // the statistics module (CallStats) is stopped.
                //
                // NOTE The LogCollector is not stopped, because this event can
                // be triggered multiple times during single conference
                // (whenever statistics module is stopped). That includes
                // the case when Jicofo terminates the single person left in the
                // room. It will then restart the media session when someone
                // eventually join the room which will start the stats again.
                APP.conference.addConferenceListener(
                    JitsiConferenceEvents.BEFORE_STATISTICS_DISPOSED,
                    () => {
                        if (APP.logCollector) {
                            APP.logCollector.flush();
                        }
                    }
                );
            }

            APP.UI.initConference();

            APP.UI.addListener(UIEvents.LANG_CHANGED, language => {
                APP.translation.setLanguage(language);
                APP.settings.setLanguage(language);
            });

            APP.keyboardshortcut.init();

            if (config.requireDisplayName) {
                if (!APP.settings.getDisplayName()) {
                    APP.UI.promptDisplayName();
                }
            }
        })
            .catch(err => {
                APP.UI.hideRingOverLay();
                APP.API.notifyConferenceLeft(APP.conference.roomName);
                logger.error(err);

                dispatch(setUnsupportedBrowser(err));

                // If during the conference initialization was defined that
                // browser doesn't support WebRTC then we should define
                // which route to render.
                dispatch(appNavigate(room));

                // Force reinitialization of the conference if WebRTC is ready.
                if (err.webRTCReadyPromise) {
                    err.webRTCReadyPromise.then(() => {
                        // Setting plugin required flag to false because
                        // it's already been installed.
                        dispatch(setUnsupportedBrowser({
                            isPluginRequired: false
                        }));
                        dispatch(appNavigate(room));
                    });
                }
            });
    };
}

/**
 * Closes connection.
 *
 * @returns {Function}
 */
export function disconnect() {
    // XXX For web based version we use conference hanging up logic from the old
    // app.
    return () => APP.conference.hangup();
}

/**
 * Sets connection domain.
 *
 * @param {string} domain - Domain name.
 * @returns {{
 *      type: SET_DOMAIN,
 *      domain: string
 *  }}
 */
export function setDomain(domain: string) {
    return {
        type: SET_DOMAIN,
        domain
    };
}
