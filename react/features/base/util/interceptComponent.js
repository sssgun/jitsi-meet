/* @flow */

import { Platform } from '../react';
import {
    NoMobileApp,
    PluginRequiredBrowser,
    UnsupportedDesktopBrowser,
    UnsupportedMobileBrowser
} from '../../unsupported-browser';

declare var APP: Object;
declare var interfaceConfig: Object;

/**
 * Array of rules defining whether we should intercept component to render
 * or not.
 *
 * @private
 * @param {Object} state - Object containing current Redux state.
 * @returns {ReactElement|void}
 * @type {Function[]}
 */
const _RULES = [

    /**
     * This rule describes case when user opens application using mobile
     * browser. In order to promote the app, we choose to suggest the mobile
     * app even if the browser supports the app (e.g. Google Chrome with
     * WebRTC support on Android).
     *
     * @param {Object} state - Redux state of the app.
     *
     * @returns {UnsupportedMobileBrowser|void} If the rule is satisfied then
     * we should intercept existing component by UnsupportedMobileBrowser.
     */
    () => {
        const OS = Platform.OS;

        if (OS === 'android' || OS === 'ios') {
            return (
                interfaceConfig.MOBILE_APP_ENABLED
                    ? UnsupportedMobileBrowser
                    : NoMobileApp);
        }
    },
    state => {
        const {
            isOldBrowser,
            isPluginRequired
        } = state['features/unsupported-browser'];

        if (isOldBrowser) {
            return UnsupportedDesktopBrowser;
        }

        if (isPluginRequired) {
            return PluginRequiredBrowser;
        }
    }
];

/**
 * Utility method that responsible for intercepting of route components based on
 * the set of defined rules.
 *
 * @param {Object|Function} stateOrGetState - Either Redux state object or
 * getState() function.
 * @param {ReactElement} component - Current route component to render.
 * @returns {ReactElement} If any of rules is satisfied returns intercepted
 * component.
 */
export function interceptComponent(stateOrGetState: Object,
                                   component: ReactElement<*>) {
    let result;
    const state
        = typeof stateOrGetState === 'function'
            ? stateOrGetState()
            : stateOrGetState;

    for (const rule of _RULES) {
        result = rule(state);
        if (result) {
            break;
        }
    }

    return result || component;
}
