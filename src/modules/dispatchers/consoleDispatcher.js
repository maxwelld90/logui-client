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
    _public.dispatcherType = 'console';
    var _isActive = false;
    var _consoleElement = null;

    _public.init = async function() {
        return new Promise(function(resolve) {
            let initState = (
                doesConsoleElementExist()
            );

            if (initState) {
                _isActive = true;
            };

            resolve(initState);
        });
    };

    _public.isActive = function() {
        return _isActive;
    }

    _public.sendObject = function(objToSend) {
        createElement(objToSend);
        // this literally sends the object. no processing.
        // just append it to the list.
        // or in the case of the websocket, sends down the websocket.
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
    }

    function createElement(objToSend) {
        let newNode = document.createElement('li');
        let textNode = document.createTextNode(JSON.stringify(objToSend));

        newNode.appendChild(textNode);
        _consoleElement.insertBefore(newNode, _consoleElement.firstChild);

        return newNode;
    }

    return _public;
})(window);