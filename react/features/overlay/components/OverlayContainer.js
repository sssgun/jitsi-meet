/* global APP */

import React, { Component } from 'react';
import { connect } from 'react-redux';

import PageReloadOverlay from './PageReloadOverlay';
import SuspendedOverlay from './SuspendedOverlay';
import UserMediaPermissionsOverlay from './UserMediaPermissionsOverlay';

/**
 * Implements a React Component that will display the correct overlay when
 * needed.
 */
class OverlayContainer extends Component {
    /**
     * OverlayContainer component's property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * The browser which is used currently.
         *
         * NOTE: Used by UserMediaPermissionsOverlay only.
         *
         * @private
         * @type {string}
         */
        _browser: React.PropTypes.string,

        /**
         * The indicator which determines whether the status of the
         * JitsiConnection object has been "established" or not.
         *
         * NOTE: Used by PageReloadOverlay only.
         *
         * @private
         * @type {boolean}
         */
        _connectionEstablished: React.PropTypes.bool,

        /**
         * The indicator which determines whether a critical error for reload
         * has been received.
         *
         * NOTE: Used by PageReloadOverlay only.
         *
         * @private
         * @type {boolean}
         */
        _haveToReload: React.PropTypes.bool,

        /**
         * The indicator which determines whether the GUM permissions prompt is
         * displayed or not.
         *
         * NOTE: Used by UserMediaPermissionsOverlay only.
         *
         * @private
         * @type {boolean}
         */
        _isMediaPermissionPromptVisible: React.PropTypes.bool,

        /**
         * The indicator which determines whether the reload was caused by
         * network failure.
         *
         * NOTE: Used by PageReloadOverlay only.
         *
         * @private
         * @type {boolean}
         */
        _isNetworkFailure: React.PropTypes.bool,

        /**
         * The reason for the error that will cause the reload.
         *
         * NOTE: Used by PageReloadOverlay only.
         *
         * @private
         * @type {string}
         */
        _reason: React.PropTypes.string,

        /**
         * The indicator which determines whether the GUM permissions prompt is
         * displayed or not.
         *
         * NOTE: Used by SuspendedOverlay only.
         *
         * @private
         * @type {string}
         */
        _suspendDetected: React.PropTypes.bool
    }

    /**
     * React Component method that executes once component is updated.
     *
     * @inheritdoc
     * @returns {void}
     * @protected
     */
    componentDidUpdate() {
        // FIXME: Temporary workaround until everything is moved to react.
        APP.UI.overlayVisible
            = (this.props._connectionEstablished && this.props._haveToReload)
                || this.props._suspendDetected
                || this.props._isMediaPermissionPromptVisible;
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement|null}
     * @public
     */
    render() {
        if (this.props._connectionEstablished && this.props._haveToReload) {
            return (
                <PageReloadOverlay
                    isNetworkFailure = { this.props._isNetworkFailure }
                    reason = { this.props._reason } />
            );
        }

        if (this.props._suspendDetected) {
            return (
                <SuspendedOverlay />
            );
        }

        if (this.props._isMediaPermissionPromptVisible) {
            return (
                <UserMediaPermissionsOverlay
                    browser = { this.props._browser } />
            );
        }

        return null;
    }
}

/**
 * Maps (parts of) the Redux state to the associated OverlayContainer's props.
 *
 * @param {Object} state - The Redux state.
 * @returns {{
 *     _browser: string,
 *     _connectionEstablished: bool,
 *     _haveToReload: bool,
 *     _isNetworkFailure: bool,
 *     _isMediaPermissionPromptVisible: bool,
 *     _reason: string,
 *     _suspendDetected: bool
 * }}
 * @private
 */
function _mapStateToProps(state) {
    const stateFeaturesOverlay = state['features/overlay'];

    return {
        /**
         * The browser which is used currently.
         *
         * NOTE: Used by UserMediaPermissionsOverlay only.
         *
         * @private
         * @type {string}
         */
        _browser: stateFeaturesOverlay.browser,

        /**
         * The indicator which determines whether the status of the
         * JitsiConnection object has been "established" or not.
         *
         * NOTE: Used by PageReloadOverlay only.
         *
         * @private
         * @type {boolean}
         */
        _connectionEstablished: stateFeaturesOverlay.connectionEstablished,

        /**
         * The indicator which determines whether a critical error for reload
         * has been received.
         *
         * NOTE: Used by PageReloadOverlay only.
         *
         * @private
         * @type {boolean}
         */
        _haveToReload: stateFeaturesOverlay.haveToReload,

        /**
         * The indicator which determines whether the GUM permissions prompt is
         * displayed or not.
         *
         * NOTE: Used by UserMediaPermissionsOverlay only.
         *
         * @private
         * @type {boolean}
         */
        _isMediaPermissionPromptVisible:
            stateFeaturesOverlay.isMediaPermissionPromptVisible,

        /**
         * The indicator which determines whether the reload was caused by
         * network failure.
         *
         * NOTE: Used by PageReloadOverlay only.
         *
         * @private
         * @type {boolean}
         */
        _isNetworkFailure: stateFeaturesOverlay.isNetworkFailure,

        /**
         * The reason for the error that will cause the reload.
         *
         * NOTE: Used by PageReloadOverlay only.
         *
         * @private
         * @type {string}
         */
        _reason: stateFeaturesOverlay.reason,

        /**
         * The indicator which determines whether the GUM permissions prompt is
         * displayed or not.
         *
         * NOTE: Used by SuspendedOverlay only.
         *
         * @private
         * @type {string}
         */
        _suspendDetected: stateFeaturesOverlay.suspendDetected
    };
}

export default connect(_mapStateToProps)(OverlayContainer);
