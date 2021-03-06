/*
    LogUI Client Library
    Page-based Dispatcher

    A dispatcher object that outputs elements to a "console" element on a page.
    No network or server activity involved.

    @module: Page-based Dispatcher
    @author: David Maxwell
    @date: 2020-09-20
*/

import Config from '../config';
import Helpers from '../helpers'
import Defaults from '../defaults';
import RequiredFeatures from '../required';
import ValidationSchemas from '../validationSchemas';

Defaults.dispatcher = {
    consoleElement: null,  // The element that the console is rendered in.
}

RequiredFeatures.addFeature('document.createElement');
RequiredFeatures.addFeature('document.createTextNode');

ValidationSchemas.addLogUIConfigProperty('consoleElement', 'string');

export default (function(root) {
    var _public = {};
    var _isActive = false;
    var _consoleElement = null;
    _public.dispatcherType = 'console';

    _public.init = async function() {
        return new Promise(function(resolve) {
            let initState = (
                doesConsoleElementExist() &&
                getSessionDetails()
            );

            if (initState) {
                _isActive = true;
            };
            
            root.dispatchEvent(new Event('logUIStarted'));
            resolve(initState);
        });
    };

    _public.isActive = function() {
        return _isActive;
    }

    _public.sendObject = function(objToSend) {
        createElement(objToSend);
    };

    _public.stop = function() {
        return new Promise(resolve => {
            setTimeout(() => {_isActive = false; resolve(true)}, 1000);
        });
    };

    function doesConsoleElementExist() {
        let consoleElementString = Config.getConfigProperty('consoleElement');
        _consoleElement = Helpers.$(consoleElementString);

        if (!_consoleElement) {
            Helpers.console(`The dispatcher cannot find the specified console element (${consoleElementString}) in the DOM.`, 'Initialisation', true);
            return false;
        }

        return true;
    };

    function createElement(objToSend) {
        let newNode = document.createElement('li');

        newNode.appendChild(document.createTextNode(objToSend.eventType));
        newNode.appendChild(document.createElement('br'));
        newNode.appendChild(document.createTextNode(getEventDetails(objToSend)));
        _consoleElement.insertBefore(newNode, _consoleElement.firstChild);

        return newNode;
    };

    function getEventDetails(objToSend) {
        switch (objToSend.eventType) {
            case 'interactionEvent':
                return objToSend.eventDetails.type;
            case 'browserEvent':
                switch (objToSend.eventDetails.type) {
                    case 'contextMenuFired':
                        return 'Context menu requested';
                    case 'cursorTracking':
                        switch (objToSend.eventDetails.trackingType) {
                            case 'positionUpdate':
                                return `Cursor at ${objToSend.eventDetails.clientX},${objToSend.eventDetails.clientY} in viewport`;
                            case 'cursorLeftViewport':
                                return `Cursor left viewport at ${objToSend.eventDetails.clientX},${objToSend.eventDetails.clientY}`;
                            case 'cursorEnteredViewport':
                                return `Cursor entered viewport at ${objToSend.eventDetails.clientX},${objToSend.eventDetails.clientY}`;
                        };
                    case 'viewportFocusChange':
                        if (objToSend.eventDetails.hasFocus) {
                            return 'Viewport is now the active window';
                        }
                        else {
                            return 'Viewport focus has been lost';
                        }
                    case 'URLChange':
                        return `URL changed in browser to ${objToSend.eventDetails.newURL}`;
                    case 'viewportResize':
                        return `Viewport resized to ${objToSend.eventDetails.viewportWidth}x${objToSend.eventDetails.viewportHeight}`;
                }
            case 'statusEvent':
                switch (objToSend.eventDetails.type) {
                    case 'started':
                        return 'LogUI Started';
                    case 'stopped':
                        return 'LogUI Stopped';
                    case 'applicationSpecificDataUpdated':
                        return 'Application specific data was updated';
                }
        }
    }

    function getSessionDetails() {
        let currentTimestamp = new Date();

        if (Config.sessionData.getSessionIDKey()) {
            Config.sessionData.setIDFromSession();
            Config.sessionData.setTimestamps(currentTimestamp, currentTimestamp); // The first date should come from the server (for the session start time).

            //return false; // If the server disagrees with the key supplied, you'd return false here to fail the initialisation.
        }
        else {
            // Create a new session.
            // For the websocket dispatcher, we'd send off a blank session ID field, and it will return a new one.
            Config.sessionData.setID('CONSOLE-SESSION-ID'); // ID should come from the server in the websocket dispatcher.
            Config.sessionData.setTimestamps(currentTimestamp, currentTimestamp);
        }

        return true;
    };

    return _public;
})(window);