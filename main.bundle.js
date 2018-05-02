webpackJsonp(["main"],{

/***/ "../node_modules/hammerjs/hammer.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
        return Hammer;
    }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');


/***/ }),

/***/ "./src/$$_lazy_route_resource lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<div id=\"main\">\n    <app-navbar></app-navbar>\n    <div class=\"container\">\n        <flash-messages></flash-messages>\n        <!-- <mc-breadcrumbs></mc-breadcrumbs> -->\n        <router-outlet></router-outlet>\n    </div>\n</div>\n\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var AppComponent = /** @class */ (function () {
    function AppComponent() {
        this.title = 'app';
    }
    AppComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-root',
            template: __webpack_require__("./src/app/app.component.html"),
            styles: [__webpack_require__("./src/app/app.component.css")]
        })
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("./node_modules/@angular/platform-browser/esm5/platform-browser.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__("./node_modules/@angular/http/esm5/http.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_common_http__ = __webpack_require__("./node_modules/@angular/common/esm5/http.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__ = __webpack_require__("./src/app/guards/auth.guard.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__material_module__ = __webpack_require__("./src/app/material.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_hammerjs__ = __webpack_require__("../node_modules/hammerjs/hammer.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_hammerjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9_hammerjs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__angular_platform_browser_animations__ = __webpack_require__("./node_modules/@angular/platform-browser/esm5/animations.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_ngx_bootstrap_datetime_popup__ = __webpack_require__("./node_modules/ngx-bootstrap-datetime-popup/dist/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__app_component__ = __webpack_require__("./src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__components_navbar_navbar_component__ = __webpack_require__("./src/app/components/navbar/navbar.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__components_login_login_component__ = __webpack_require__("./src/app/components/login/login.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__components_register_register_component__ = __webpack_require__("./src/app/components/register/register.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__components_profile_profile_component__ = __webpack_require__("./src/app/components/profile/profile.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__components_dashboard_dashboard_component__ = __webpack_require__("./src/app/components/dashboard/dashboard.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__components_home_home_component__ = __webpack_require__("./src/app/components/home/home.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_22_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__components_invoice_invoice_component__ = __webpack_require__("./src/app/components/invoice/invoice.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24__components_estimates_estimates_component__ = __webpack_require__("./src/app/components/estimates/estimates.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__components_reminders_reminders_component__ = __webpack_require__("./src/app/components/reminders/reminders.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__components_projects_projects_component__ = __webpack_require__("./src/app/components/projects/projects.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__components_company_company_component__ = __webpack_require__("./src/app/components/company/company.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__components_company_add_company_add_company_component__ = __webpack_require__("./src/app/components/company/add-company/add-company.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__components_company_view_company_view_company_component__ = __webpack_require__("./src/app/components/company/view-company/view-company.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_30__components_view_company_profile_select_employee_select_employee_component__ = __webpack_require__("./src/app/components/view-company-profile/select-employee/select-employee.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__components_view_company_profile_view_company_profile_component__ = __webpack_require__("./src/app/components/view-company-profile/view-company-profile.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_32__components_view_employee_profile_view_employee_profile_component__ = __webpack_require__("./src/app/components/view-employee-profile/view-employee-profile.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_33__components_timesheet_timesheet_component__ = __webpack_require__("./src/app/components/timesheet/timesheet.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_34_angular_calendar__ = __webpack_require__("./node_modules/angular-calendar/esm5/angular-calendar.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_35__components_confirmation_dialog_confirmation_dialog_component__ = __webpack_require__("./src/app/components/confirmation-dialog/confirmation-dialog.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_36__components_calendar_calendar_component__ = __webpack_require__("./src/app/components/calendar/calendar.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_37__components_utils_module__ = __webpack_require__("./src/app/components/utils/module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_38__components_stages_stages_component__ = __webpack_require__("./src/app/components/stages/stages.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_39__components_projects_create_project_create_project_component__ = __webpack_require__("./src/app/components/projects/create-project/create-project.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_40__components_projects_view_project_view_project_component__ = __webpack_require__("./src/app/components/projects/view-project/view-project.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_41__components_projects_update_project_update_project_component__ = __webpack_require__("./src/app/components/projects/update-project/update-project.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_42__components_clients_clients_component__ = __webpack_require__("./src/app/components/clients/clients.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_43__components_employee_management_employee_management_component__ = __webpack_require__("./src/app/components/employee-management/employee-management.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_44__pipes_search_pipe_pipe__ = __webpack_require__("./src/app/pipes/search-pipe.pipe.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_45__pipes_client_pipe__ = __webpack_require__("./src/app/pipes/client.pipe.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_46__components_clients_view_client_view_client_component__ = __webpack_require__("./src/app/components/clients/view-client/view-client.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_47__components_clients_edit_client_edit_client_component__ = __webpack_require__("./src/app/components/clients/edit-client/edit-client.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_48__pipes_employee_pipe__ = __webpack_require__("./src/app/pipes/employee.pipe.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_49__components_timesheet_view_timesheet_view_timesheet_component__ = __webpack_require__("./src/app/components/timesheet/view-timesheet/view-timesheet.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_50__components_timesheet_view_by_date_view_by_date_component__ = __webpack_require__("./src/app/components/timesheet/view-by-date/view-by-date.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_51__pipes_order_by_pipe__ = __webpack_require__("./src/app/pipes/order-by.pipe.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};













// import {TabsTemplateLabelExample} from './app/tabs-template-label-example';








































var appRoutes = [
    { path: '', component: __WEBPACK_IMPORTED_MODULE_19__components_home_home_component__["a" /* HomeComponent */] },
    { path: 'home', component: __WEBPACK_IMPORTED_MODULE_19__components_home_home_component__["a" /* HomeComponent */] },
    { path: 'register', component: __WEBPACK_IMPORTED_MODULE_16__components_register_register_component__["a" /* RegisterComponent */] },
    { path: 'login', component: __WEBPACK_IMPORTED_MODULE_15__components_login_login_component__["a" /* LoginComponent */] },
    { path: 'profile', component: __WEBPACK_IMPORTED_MODULE_17__components_profile_profile_component__["a" /* ProfileComponent */] },
    { path: 'stages', component: __WEBPACK_IMPORTED_MODULE_38__components_stages_stages_component__["a" /* StagesComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'dashboard', component: __WEBPACK_IMPORTED_MODULE_18__components_dashboard_dashboard_component__["a" /* DashboardComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'invoice', component: __WEBPACK_IMPORTED_MODULE_23__components_invoice_invoice_component__["a" /* InvoiceComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'company', component: __WEBPACK_IMPORTED_MODULE_27__components_company_company_component__["a" /* CompanyComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'reminder', component: __WEBPACK_IMPORTED_MODULE_25__components_reminders_reminders_component__["a" /* RemindersComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    //{path:'calender', component:DashboardComponent, canActivate:[AuthGuard]},
    { path: 'estimates', component: __WEBPACK_IMPORTED_MODULE_24__components_estimates_estimates_component__["a" /* EstimatesComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'view-company-profile', component: __WEBPACK_IMPORTED_MODULE_31__components_view_company_profile_view_company_profile_component__["a" /* ViewCompanyProfileComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'view-employee-profile', component: __WEBPACK_IMPORTED_MODULE_32__components_view_employee_profile_view_employee_profile_component__["a" /* ViewEmployeeProfileComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'ViewCompany', component: __WEBPACK_IMPORTED_MODULE_29__components_company_view_company_view_company_component__["a" /* ViewCompanyComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'AddCompany', component: __WEBPACK_IMPORTED_MODULE_28__components_company_add_company_add_company_component__["a" /* AddCompanyComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'timesheets', component: __WEBPACK_IMPORTED_MODULE_33__components_timesheet_timesheet_component__["a" /* TimesheetComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'calendar', component: __WEBPACK_IMPORTED_MODULE_36__components_calendar_calendar_component__["a" /* CalendarComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'projects', component: __WEBPACK_IMPORTED_MODULE_26__components_projects_projects_component__["a" /* ProjectsComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'projects/:id', component: __WEBPACK_IMPORTED_MODULE_40__components_projects_view_project_view_project_component__["a" /* ViewProjectComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'clients', component: __WEBPACK_IMPORTED_MODULE_42__components_clients_clients_component__["a" /* ClientsComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'clients/:id', component: __WEBPACK_IMPORTED_MODULE_46__components_clients_view_client_view_client_component__["a" /* ViewClientComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'timesheets/:id', component: __WEBPACK_IMPORTED_MODULE_49__components_timesheet_view_timesheet_view_timesheet_component__["a" /* ViewTimesheetComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'tsbydate', component: __WEBPACK_IMPORTED_MODULE_50__components_timesheet_view_by_date_view_by_date_component__["a" /* ViewByDateComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'employees-manager', component: __WEBPACK_IMPORTED_MODULE_43__components_employee_management_employee_management_component__["a" /* EmployeeManagementComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] },
    { path: 'employees-manager/:id', component: __WEBPACK_IMPORTED_MODULE_30__components_view_company_profile_select_employee_select_employee_component__["a" /* SelectEmployeeComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */]] }
];
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
            exports: [__WEBPACK_IMPORTED_MODULE_10__angular_material__["b" /* MatAutocompleteModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["c" /* MatButtonModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["d" /* MatButtonToggleModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["e" /* MatCardModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["f" /* MatCheckboxModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["g" /* MatChipsModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["D" /* MatStepperModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["h" /* MatDatepickerModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["j" /* MatDialogModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["k" /* MatDividerModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["l" /* MatExpansionModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["m" /* MatGridListModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["n" /* MatIconModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["o" /* MatInputModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["p" /* MatListModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["q" /* MatMenuModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["r" /* MatNativeDateModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["s" /* MatPaginatorModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["t" /* MatProgressBarModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["u" /* MatProgressSpinnerModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["v" /* MatRadioModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["w" /* MatRippleModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["x" /* MatSelectModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["y" /* MatSidenavModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["A" /* MatSliderModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["z" /* MatSlideToggleModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["B" /* MatSnackBarModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["C" /* MatSortModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["E" /* MatTableModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["F" /* MatTabsModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["G" /* MatToolbarModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["H" /* MatTooltipModule */]],
            declarations: [
                __WEBPACK_IMPORTED_MODULE_13__app_component__["a" /* AppComponent */],
                __WEBPACK_IMPORTED_MODULE_14__components_navbar_navbar_component__["a" /* NavbarComponent */],
                __WEBPACK_IMPORTED_MODULE_15__components_login_login_component__["a" /* LoginComponent */],
                __WEBPACK_IMPORTED_MODULE_16__components_register_register_component__["a" /* RegisterComponent */],
                __WEBPACK_IMPORTED_MODULE_17__components_profile_profile_component__["a" /* ProfileComponent */],
                __WEBPACK_IMPORTED_MODULE_18__components_dashboard_dashboard_component__["a" /* DashboardComponent */],
                __WEBPACK_IMPORTED_MODULE_19__components_home_home_component__["a" /* HomeComponent */],
                __WEBPACK_IMPORTED_MODULE_23__components_invoice_invoice_component__["a" /* InvoiceComponent */],
                __WEBPACK_IMPORTED_MODULE_24__components_estimates_estimates_component__["a" /* EstimatesComponent */],
                __WEBPACK_IMPORTED_MODULE_25__components_reminders_reminders_component__["a" /* RemindersComponent */],
                __WEBPACK_IMPORTED_MODULE_26__components_projects_projects_component__["a" /* ProjectsComponent */],
                __WEBPACK_IMPORTED_MODULE_30__components_view_company_profile_select_employee_select_employee_component__["a" /* SelectEmployeeComponent */],
                __WEBPACK_IMPORTED_MODULE_27__components_company_company_component__["a" /* CompanyComponent */],
                __WEBPACK_IMPORTED_MODULE_28__components_company_add_company_add_company_component__["a" /* AddCompanyComponent */],
                __WEBPACK_IMPORTED_MODULE_29__components_company_view_company_view_company_component__["a" /* ViewCompanyComponent */],
                __WEBPACK_IMPORTED_MODULE_31__components_view_company_profile_view_company_profile_component__["a" /* ViewCompanyProfileComponent */],
                __WEBPACK_IMPORTED_MODULE_35__components_confirmation_dialog_confirmation_dialog_component__["a" /* ConfirmationDialogComponent */],
                __WEBPACK_IMPORTED_MODULE_32__components_view_employee_profile_view_employee_profile_component__["a" /* ViewEmployeeProfileComponent */],
                __WEBPACK_IMPORTED_MODULE_33__components_timesheet_timesheet_component__["a" /* TimesheetComponent */],
                __WEBPACK_IMPORTED_MODULE_36__components_calendar_calendar_component__["a" /* CalendarComponent */],
                __WEBPACK_IMPORTED_MODULE_38__components_stages_stages_component__["a" /* StagesComponent */],
                __WEBPACK_IMPORTED_MODULE_39__components_projects_create_project_create_project_component__["a" /* CreateProjectComponent */],
                __WEBPACK_IMPORTED_MODULE_40__components_projects_view_project_view_project_component__["a" /* ViewProjectComponent */],
                __WEBPACK_IMPORTED_MODULE_41__components_projects_update_project_update_project_component__["a" /* UpdateProjectComponent */],
                __WEBPACK_IMPORTED_MODULE_42__components_clients_clients_component__["a" /* ClientsComponent */],
                __WEBPACK_IMPORTED_MODULE_43__components_employee_management_employee_management_component__["a" /* EmployeeManagementComponent */],
                __WEBPACK_IMPORTED_MODULE_44__pipes_search_pipe_pipe__["a" /* SearchPipePipe */],
                __WEBPACK_IMPORTED_MODULE_45__pipes_client_pipe__["a" /* ClientPipe */],
                __WEBPACK_IMPORTED_MODULE_46__components_clients_view_client_view_client_component__["a" /* ViewClientComponent */],
                __WEBPACK_IMPORTED_MODULE_47__components_clients_edit_client_edit_client_component__["a" /* EditClientComponent */],
                __WEBPACK_IMPORTED_MODULE_48__pipes_employee_pipe__["a" /* EmployeePipe */],
                __WEBPACK_IMPORTED_MODULE_49__components_timesheet_view_timesheet_view_timesheet_component__["a" /* ViewTimesheetComponent */],
                __WEBPACK_IMPORTED_MODULE_50__components_timesheet_view_by_date_view_by_date_component__["a" /* ViewByDateComponent */],
                __WEBPACK_IMPORTED_MODULE_51__pipes_order_by_pipe__["a" /* OrderByPipe */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_37__components_utils_module__["a" /* UtilsModule */],
                __WEBPACK_IMPORTED_MODULE_8__ng_bootstrap_ng_bootstrap__["c" /* NgbModalModule */].forRoot(),
                __WEBPACK_IMPORTED_MODULE_34_angular_calendar__["a" /* CalendarModule */].forRoot(),
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["d" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_3__angular_http__["c" /* HttpModule */],
                __WEBPACK_IMPORTED_MODULE_5__angular_common_http__["b" /* HttpClientModule */],
                __WEBPACK_IMPORTED_MODULE_4__angular_router__["c" /* RouterModule */].forRoot(appRoutes),
                __WEBPACK_IMPORTED_MODULE_22_angular2_flash_messages__["FlashMessagesModule"].forRoot(),
                __WEBPACK_IMPORTED_MODULE_7__material_module__["a" /* MaterialModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["H" /* MatTooltipModule */],
                __WEBPACK_IMPORTED_MODULE_8__ng_bootstrap_ng_bootstrap__["d" /* NgbModule */].forRoot(),
                __WEBPACK_IMPORTED_MODULE_11__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
                __WEBPACK_IMPORTED_MODULE_10__angular_material__["r" /* MatNativeDateModule */],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["i" /* ReactiveFormsModule */],
                __WEBPACK_IMPORTED_MODULE_12_ngx_bootstrap_datetime_popup__["a" /* DatetimePopupModule */].forRoot()
            ],
            providers: [__WEBPACK_IMPORTED_MODULE_20__services_validate_service__["a" /* ValidateService */], __WEBPACK_IMPORTED_MODULE_6__guards_auth_guard__["a" /* AuthGuard */], __WEBPACK_IMPORTED_MODULE_21__services_auth_service__["a" /* AuthService */]],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_13__app_component__["a" /* AppComponent */]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/components/calendar/calendar.component.css":
/***/ (function(module, exports) {

module.exports = "h3 {\r\n    margin: 0 0 10px;\r\n  }\r\n  \r\n  pre {\r\n    background-color: #f5f5f5;\r\n    padding: 15px;\r\n  }\r\n\r\n  "

/***/ }),

/***/ "./src/app/components/calendar/calendar.component.html":
/***/ (function(module, exports) {

module.exports = "<ng-template #modalContent let-close=\"close\">\n  <div class=\"modal-header\">\n    <h5 class=\"modal-title\">Event action occurred</h5>\n    <button type=\"button\" class=\"close\" (click)=\"close()\">\n      <span aria-hidden=\"true\">&times;</span>\n    </button>\n  </div>\n  <div class=\"modal-body\">\n    <div>\n      Action:\n      <pre>{{ modalData?.action }}</pre>\n    </div>\n    <div>\n      Event:\n      <pre>{{ modalData?.event | json }}</pre>\n    </div>\n  </div>\n  <div class=\"modal-footer\">\n    <button type=\"button\" class=\"btn btn-outline-secondary\" (click)=\"close()\">OK</button>\n  </div>\n</ng-template>\n\n<div class=\"row text-center\">\n  <div class=\"col-md-4\">\n    <div class=\"btn-group\">\n      <div\n        class=\"btn btn-primary\"\n        mwlCalendarPreviousView\n        [view]=\"view\"\n        [(viewDate)]=\"viewDate\"\n        (viewDateChange)=\"activeDayIsOpen = false\">\n        Previous\n      </div>\n      <div\n        class=\"btn btn-outline-secondary\"\n        mwlCalendarToday\n        [(viewDate)]=\"viewDate\">\n        Today\n      </div>\n      <div\n        class=\"btn btn-primary\"\n        mwlCalendarNextView\n        [view]=\"view\"\n        [(viewDate)]=\"viewDate\"\n        (viewDateChange)=\"activeDayIsOpen = false\">\n        Next\n      </div>\n    </div>\n  </div>\n  <div class=\"col-md-4\">\n    <h3>{{ viewDate | calendarDate:(view + 'ViewTitle'):'en' }}</h3>\n  </div>\n  <div class=\"col-md-4\">\n    <div class=\"btn-group\">\n      <div\n        class=\"btn btn-primary\"\n        (click)=\"view = 'month'\"\n        [class.active]=\"view === 'month'\">\n        Month\n      </div>\n      <div\n        class=\"btn btn-primary\"\n        (click)=\"view = 'week'\"\n        [class.active]=\"view === 'week'\">\n        Week\n      </div>\n      <div\n        class=\"btn btn-primary\"\n        (click)=\"view = 'day'\"\n        [class.active]=\"view === 'day'\">\n        Day\n      </div>\n    </div>\n  </div>\n</div>\n<br>\n<div [ngSwitch]=\"view\">\n  <mwl-calendar-month-view\n    *ngSwitchCase=\"'month'\"\n    [viewDate]=\"viewDate\"\n    [events]=\"events\"\n    [refresh]=\"refresh\"\n    [activeDayIsOpen]=\"activeDayIsOpen\"\n    (dayClicked)=\"dayClicked($event.day)\"\n    (eventClicked)=\"handleEvent('Clicked', $event.event)\"\n    (eventTimesChanged)=\"eventTimesChanged($event)\">\n  </mwl-calendar-month-view>\n  <mwl-calendar-week-view\n    *ngSwitchCase=\"'week'\"\n    [viewDate]=\"viewDate\"\n    [events]=\"events\"\n    [refresh]=\"refresh\"\n    (eventClicked)=\"handleEvent('Clicked', $event.event)\"\n    (eventTimesChanged)=\"eventTimesChanged($event)\">\n  </mwl-calendar-week-view>\n  <mwl-calendar-day-view\n    *ngSwitchCase=\"'day'\"\n    [viewDate]=\"viewDate\"\n    [events]=\"events\"\n    [refresh]=\"refresh\"\n    (eventClicked)=\"handleEvent('Clicked', $event.event)\"\n    (eventTimesChanged)=\"eventTimesChanged($event)\">\n  </mwl-calendar-day-view>\n</div>\n\n<br><br><br>\n\n<h3>\n  Edit events\n  <button\n    class=\"btn btn-primary pull-right\"\n    (click)=\"addEvent()\">\n    Add new\n  </button>\n  <div class=\"clearfix\"></div>\n</h3>\n\n<table class=\"table table-bordered\">\n\n  <thead>\n    <tr>\n      <th>Title</th>\n      <th>Primary color</th>\n      <th>Secondary color</th>\n      <th>Starts at</th>\n      <th>Ends at</th>\n      <th>Action</th>\n    </tr>\n  </thead>\n\n  <tbody>\n    <tr *ngFor=\"let event of events; let i = index\">\n      <td>\n        <input\n          type=\"text\"\n          class=\"form-control\"\n          [(ngModel)]=\"event.title\"\n          (keyup)=\"refresh.next()\">\n      </td>\n      <td>\n        <input\n          type=\"color\"\n          [(ngModel)]=\"event.color.primary\"\n          (change)=\"refresh.next()\">\n      </td>\n      <td>\n        <input\n          type=\"color\"\n          [(ngModel)]=\"event.color.secondary\"\n          (change)=\"refresh.next()\">\n      </td>\n      <td>\n        <mwl-utils-date-time-picker\n          [(ngModel)]=\"event.start\"\n          (ngModelChange)=\"refresh.next()\"\n          placeholder=\"Not set\">\n        </mwl-utils-date-time-picker>\n      </td>\n      <td>\n        <mwl-utils-date-time-picker\n          [(ngModel)]=\"event.end\"\n          (ngModelChange)=\"refresh.next()\"\n          placeholder=\"Not set\">\n        </mwl-utils-date-time-picker>\n      </td>\n      <td>\n        <button\n          class=\"btn btn-warning\"\n          (click)=\"removeEvent(i);\">\n          Delete\n        </button>\n        <button\n          class=\"btn btn-primary\"\n          (click)=\"updateEvent(i);\">\n          Update\n        </button>\n      </td>\n    </tr>\n  </tbody>\n\n</table>"

/***/ }),

/***/ "./src/app/components/calendar/calendar.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CalendarComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_date_fns__ = __webpack_require__("./node_modules/date-fns/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_date_fns___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_date_fns__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_Subject__ = __webpack_require__("./node_modules/rxjs/_esm5/Subject.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









var colors = {
    red: {
        primary: '#ad2121',
        secondary: '#FAE3E3'
    },
    blue: {
        primary: '#1e90ff',
        secondary: '#D1E8FF'
    },
    yellow: {
        primary: '#e3bc08',
        secondary: '#FDF1BA'
    }
};
var CalendarComponent = /** @class */ (function () {
    function CalendarComponent(validateService, flashMessages, authService, router, modal) {
        var _this = this;
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.modal = modal;
        this.view = 'month';
        this.viewDate = new Date();
        this.updateable = false;
        this.actions = [
            {
                label: '<i class="glyphicon glyphicon-pencil"></i>',
                onClick: function (_a) {
                    var event = _a.event;
                }
            },
            {
                label: '<i class="glyphicon glyphicon-time"></i>',
                onClick: function (_a) {
                    var event = _a.event;
                    _this.events = _this.events.filter(function (iEvent) { return iEvent !== event; });
                    _this.handleEvent('Deleted', event);
                }
            }
        ];
        this.refresh = new __WEBPACK_IMPORTED_MODULE_6_rxjs_Subject__["a" /* Subject */]();
        this.events = [];
        this.activeDayIsOpen = true;
    }
    CalendarComponent.prototype.logit = function (i) {
        var _this = this;
        this.authService.removeEvents(this.events[i]).subscribe(function (eve) {
            _this.flashMessages.show(eve.msg, {
                cssClass: 'alert-success', timeout: 3000
            });
            _this.ngOnInit();
        }, function (err) {
            _this.flashMessages.show('You failed to delete the calendar event. ' + err, {
                cssClass: 'alert-danger', timeout: 3000
            });
            console.log(err);
            return false;
        });
    };
    CalendarComponent.prototype.dayClicked = function (_a) {
        var date = _a.date, events = _a.events;
        if (Object(__WEBPACK_IMPORTED_MODULE_5_date_fns__["isSameMonth"])(date, this.viewDate)) {
            if ((Object(__WEBPACK_IMPORTED_MODULE_5_date_fns__["isSameDay"])(this.viewDate, date) && this.activeDayIsOpen === true) ||
                events.length === 0) {
                this.activeDayIsOpen = false;
            }
            else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
    };
    CalendarComponent.prototype.eventTimesChanged = function (_a) {
        var event = _a.event, newStart = _a.newStart, newEnd = _a.newEnd;
        event.start = newStart;
        event.end = newEnd;
        this.handleEvent('Dropped or resized', event);
        this.refresh.next();
    };
    CalendarComponent.prototype.handleEvent = function (action, event) {
        this.modalData = { event: event, action: action };
        this.modal.open(this.modalContent, { size: 'lg' });
    };
    CalendarComponent.prototype.removeEvent = function (i) {
        var _this = this;
        this.authService.removeEvents(this.events[i]).subscribe(function (eve) {
            _this.flashMessages.show(eve.msg, {
                cssClass: 'alert-success', timeout: 3000
            });
            _this.ngOnInit();
        }, function (err) {
            _this.flashMessages.show('You failed to delete the calendar event. ' + err, {
                cssClass: 'alert-danger', timeout: 3000
            });
            console.log(err);
            return false;
        });
    };
    CalendarComponent.prototype.updateEvent = function (i) {
        var _this = this;
        this.authService.updateEvent(this.events[i]).subscribe(function (events) {
            _this.flashMessages.show("Your Event is now updated", {
                cssClass: 'alert-success', timeout: 3000
            });
            _this.ngOnInit();
        }, function (err) {
            _this.flashMessages.show('You failed update a calendar event!! ' + err, {
                cssClass: 'alert-danger', timeout: 3000
            });
            console.log(err);
            return false;
        });
    };
    CalendarComponent.prototype.addEvent = function () {
        var _this = this;
        var event = {
            empId: this.account._id,
            title: 'New event',
            start: Object(__WEBPACK_IMPORTED_MODULE_5_date_fns__["startOfDay"])(new Date()),
            end: Object(__WEBPACK_IMPORTED_MODULE_5_date_fns__["endOfDay"])(new Date()),
            color: colors.red,
            draggable: true,
        };
        this.authService.addEvents(event).subscribe(function (events) {
            _this.flashMessages.show(events.msg, {
                cssClass: 'alert-success', timeout: 3000
            });
            _this.ngOnInit();
        }, function (err) {
            _this.flashMessages.show('You failed adding a calendar event', {
                cssClass: 'alert-warning', timeout: 3000
            });
            console.log(err);
            return false;
        });
        this.refresh.next();
    };
    CalendarComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.authService.getProfile().subscribe(function (profile) {
            _this.account = profile.employee;
            _this.authService.getEvents(profile.employee).subscribe(function (eve) {
                console.log(eve.event);
                _this.events = eve.event;
                _this.origEvents = eve;
                _this.refresh.next();
            }, function (err) {
                console.log(err);
                return false;
            });
        }, function (err) {
            console.log(err);
            return false;
        });
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewChild"])('modalContent'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_0__angular_core__["TemplateRef"])
    ], CalendarComponent.prototype, "modalContent", void 0);
    CalendarComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-calendar',
            changeDetection: __WEBPACK_IMPORTED_MODULE_0__angular_core__["ChangeDetectionStrategy"].OnPush,
            template: __webpack_require__("./src/app/components/calendar/calendar.component.html"),
            styles: [__webpack_require__("./src/app/components/calendar/calendar.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_7__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */]])
    ], CalendarComponent);
    return CalendarComponent;
}());



/***/ }),

/***/ "./src/app/components/clients/clients.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/clients/clients.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"col-sm-12 \" *ngIf=\"togClient\">\n<form #f=\"ngForm\" (ngSubmit)=\"onClientSubmit(f)\">\n\n    <h1 class=\"center\">Add New Client</h1>\n    <div class=\"form-group\">\n      <label for=\"inputMob\">Client Ref Number: (Next Available ID: {{getNextIDref()}})</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputMob\" name=\"ref\" ngModel required #ref=\"ngModel\">\n    </div>\n    <div class=\"form-group\">\n      <label for=\"inputName\">Client Name</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputName\" name=\"name\" ngModel required #name=\"ngModel\" [ngStyle]=\"myStyle1\" (change)=\"myStyle1={border:checkInput(name.value)}\">\n    </div>\n\n    <div class=\"form-group\">\n      <label for=\"inputEmail\">Client Email Address</label>\n      <input type=\"email\" class=\"form-control\" id=\"inputEmail\" aria-describedby=\"emailHelp\" name=\"Email\" ngModel required #Email=\"ngModel\" [ngStyle]=\"myStyle2\" (change)=\"myStyle2={border:checkEmail(Email.value)};\">\n      <small id=\"emailHelp\" class=\"form-text text-muted\">We'll never share your email with anyone else.</small>\n    </div> \n\n    <div class=\"form-group\">\n      <label for=\"inputAddress\">Client Address</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputAddress\" name=\"address\" ngModel required #address=\"ngModel\" [ngStyle]=\"myStyle3\" (change)=\"myStyle3={border:checkInput(address.value)};\">\n    </div>\n    <div class=\"form-group\">\n      <label for=\"inputMob\">Client Mobile Number:</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputMob\" name=\"mobile\" ngModel required #mobile=\"ngModel\" [ngStyle]=\"myStyle4\" (change)=\"myStyle4={border:checkInput(mobile.value)}\">\n    </div>\n    <div class=\"form-group\">\n      <label for=\"inputOff\">Client Office Number:</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputOff\" name=\"office\" ngModel required #office=\"ngModel\" [ngStyle]=\"myStyle5\" (change)=\"myStyle5={border:checkInput(office.value)};\">\n    </div>\n  \n    \n  <input type=\"submit\" class=\" col-sm-6 btn btn-primary\" value=\"Register\"><button class=\"col-sm-6 btn btn-default\" (click)=\"togClient = !togClient\">Cancel</button>\n  </form> \n</div>\n <!-- Page Heading -->\n <div class=\"row\">\n    <div class=\"col-lg-12\">\n      <h1 class=\"page-header\">\n                        Client Manager <small>List Overview</small> <button class=\"btn btn-primary\" (click)=\"togClient = !togClient\"><i class=\"glyphicon glyphicon-plus\"></i> Add New Client</button>\n                    </h1>\n      <ol class=\"breadcrumb\">\n        <li >\n          <i class=\"fa fa-dashboard\"></i> Dashboard\n        </li>\n        <li class=\"active\">\n            <i class=\"fa fa-dashboard\"></i> Client Manager\n          </li>\n      </ol>\n    </div>\n  </div>\n  <!-- /.row -->\n<div class=\"row\">\n    <div class=\"col-sm-12\">\n        \n      \n  \n            <div class=\"form-group\">\n                   <p>Search and find your clients</p>\n                    <input type=\"text\" class=\"searchTerm col-sm-6\" placeholder=\"Search clients\" name=\"query\" [(ngModel)]=\"query\" required #searchEntry=\"ngModel\">\n                </div>\n    </div>\n\n</div>\n<div class=\"row\">\n<ngb-tabset>\n    <ngb-tab  title=\"Active\" class=\"active\">\n      <ng-template ngbTabContent>\n        <div class=\"table-responsive\">          \n            <table class=\"table table-striped\">\n              <thead>\n                <tr>\n                  \n                  <th>#</th>\n                  <th>Name</th>\n                  <th>Email</th>\n                  <th>Mobile Number</th>\n                  <th>Actions</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr *ngFor=\"let cli of (clients| orderBy:'ref') | client:query; index as i\">\n                  <td class=\"text-al--left\">{{makeRef(cli.ref)}}</td>\n                  <td class=\"text-al--left\">{{cli.Name}}</td>\n                  <td class=\"text-al--left\">{{cli.Email}}</td>\n                  <td class=\"text-al--left\">+{{cli.MobileTel}}</td>\n                  <td class=\"text-al--left\">\n                        <button class=\"btn btn-primary\" matTooltip=\"View Client Details\" (click)=\"viewClient(i)\"><i class=\"glyphicon glyphicon-eye-open\"></i></button>\n                      <button class=\"btn btn-action\" matTooltip=\"Edit Client Details(Currently Unavailable)\"><i class=\"glyphicon glyphicon-edit\"></i></button>\n                      <button class=\"btn btn-action\" matTooltip=\"Remove Client\" (click)=\"toggleRemoveModal(i);\"><i class=\"glyphicon glyphicon-remove\"></i></button>\n                  </td>\n                </tr>\n              </tbody>\n            </table>\n            </div>\n        \n      </ng-template>\n    </ngb-tab>\n   \n   \n  </ngb-tabset>\n</div>\n<div id=\"RemoveCliModal\" class=\"FormModal\" >\n    <h1>Remove Client<i class=\"glyphicon glyphicon-remove\" (click)=\"toggleRemoveModal()\">\n  </i></h1>\n  \n    <form #l=\"ngForm\" >\n     \n      <div class=\"form-group col-sm-12\"><p>Are you sure you would like to remove this client?</p> \n       \n    </div>   \n    <button class=\"btn btn-primary\" (click)=\"removeClient()\"> Remove</button>\n    <button class=\"btn btn-action\" (click)=\"toggleRemoveModal()\"> Cancel</button>\n    </form>\n    </div>\n"

/***/ }),

/***/ "./src/app/components/clients/clients.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ClientsComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var ClientsComponent = /** @class */ (function () {
    function ClientsComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.stage_i = 0;
        this.togClient = false;
        this.togRemove = false;
        this.cli_i = 0;
    }
    ClientsComponent.prototype.isCompany = function () {
        if (localStorage.getItem('isCompany') == 'true')
            return true;
        else
            return false;
    };
    ClientsComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.isCompany()) {
            this.authService.getCompany().subscribe(function (profile) {
                _this.account = profile.company;
                //  console.log(this.account.compId);
                _this.name = profile.company.name;
                _this.authService.getClients(_this.account._id).subscribe(function (data) {
                    _this.clients = data.client;
                }, function (err) {
                });
            }, function (err) {
                //  console.log(err);
                return false;
            });
        }
        else {
            this.authService.getProfile().subscribe(function (profile) {
                _this.account = profile.employee;
                //  console.log(this.account.compId);
                _this.name = profile.employee.empName;
                _this.authService.getClients(_this.account.compId).subscribe(function (profile) {
                    _this.clients = profile.client;
                    //    console.log(this.clients);
                }, function (err) {
                    //    console.log(err);
                    return false;
                });
            }, function (err) {
                //   console.log(err);
                return false;
            });
        }
    };
    ClientsComponent.prototype.getNextIDref = function () {
        console.log(this.clients.length + 1);
        return this.makeRef(this.clients.length + 1);
    };
    ClientsComponent.prototype.onClientSubmit = function (f) {
        var _this = this;
        //   console.log(f.value);
        var flag = false;
        var n = 1;
        if (f.value.ref == null || f.value.ref == "" || f.value.ref == undefined) {
            for (var i = 0; i < this.clients.length; i++) {
                if (this.clients[i].ref === n) {
                    n++;
                    i = 0;
                }
                else {
                    f.value.ref = n;
                }
            }
        }
        else {
            n = f.value.ref;
        }
        var client;
        if (this.isCompany()) {
            client = {
                ref: n,
                compId: this.account._id,
                Name: f.value.name,
                Address: f.value.address,
                MobileTel: f.value.mobile,
                OfficeTel: f.value.office,
                Email: f.value.Email
            };
        }
        else {
            client = {
                ref: n,
                compId: this.account.compId,
                Name: f.value.name,
                Address: f.value.address,
                MobileTel: f.value.mobile,
                OfficeTel: f.value.office,
                Email: f.value.Email
            };
        }
        for (var i = 0; i > this.clients.length; i++) {
            if (this.clients[i].Email == client.Email) {
                this.flashMessages.show('Please use a different email, this one is taken.', { cssClass: 'alert-danger', timeout: 3000 });
                return;
            }
        }
        //   console.log(client);
        if (!this.validateService.ValidateClientRegister(client)) {
            //       console.log('Please fill in all fields');
            this.flashMessages.show('Please fill in all the fields', { cssClass: 'alert-danger', timeout: 3000 });
        }
        if (!this.validateService.ValidateEmail(client.Email)) {
            //     console.log('Please use a valid email address');
            this.flashMessages.show('Please use a valid email address', { cssClass: 'alert-danger', timeout: 3000 });
        }
        //  console.log(client);
        this.authService.addClient(client).subscribe(function (data) {
            if (data.success) {
                console.log(data);
                _this.flashMessages.show("New Client has been added!", { cssClass: 'alert-success', timeout: 3000 });
                _this.ngOnInit();
            }
            else {
                _this.flashMessages.show('Something went wrong, Client is not registered. Please try again! ', { cssClass: 'alert-danger', timeout: 3000 });
            }
        }, function (err) {
            //    console.log(data);
            _this.flashMessages.show('Something went wrong, Client is not registered. Please try again! ' + err, { cssClass: 'alert-danger', timeout: 3000 });
        });
    };
    ClientsComponent.prototype.toggleRemoveModal = function (i) {
        console.log(i);
        this.cli_i = i;
        if (document.getElementById("RemoveCliModal").style.opacity == "1") {
            document.getElementById("RemoveCliModal").style.opacity = "0";
            document.getElementById("RemoveCliModal").style.display = "none";
        }
        else {
            document.getElementById("RemoveCliModal").style.display = "block";
            document.getElementById("RemoveCliModal").style.opacity = "1";
        }
    };
    ClientsComponent.prototype.removeClient = function () {
        var _this = this;
        console.log(this.cli_i);
        this.authService.removeClient(this.clients[this.cli_i]._id).subscribe(function (profile) {
            _this.flashMessages.show('Success, Client is now removed. !', { cssClass: 'alert-success', timeout: 3000 });
            _this.ngOnInit();
        }, function (err) {
            _this.flashMessages.show('Something went wrong, Client is not remove. Please try again!', { cssClass: 'alert-danger', timeout: 3000 });
            //    console.log(err);
            return false;
        });
    };
    ClientsComponent.prototype.viewClient = function (i) {
        //   console.log(i);
        this.router.navigate(['/clients', this.clients[i].ref]);
    };
    ClientsComponent.prototype.makeRef = function (i) {
        return ("0000" + (i)).slice(-4);
    };
    ClientsComponent.prototype.checkEmail = function (f) {
        if (!this.validateService.ValidateEmail(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    ClientsComponent.prototype.checkDob = function (f) {
        if (!this.validateService.dobFormat(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    ClientsComponent.prototype.checkInput = function (f) {
        if (!this.validateService.ValidateInput(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    ClientsComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-clients',
            template: __webpack_require__("./src/app/components/clients/clients.component.html"),
            providers: [__WEBPACK_IMPORTED_MODULE_3__services_auth_service__["a" /* AuthService */]],
            styles: [__webpack_require__("./src/app/components/clients/clients.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_3__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]])
    ], ClientsComponent);
    return ClientsComponent;
}());



/***/ }),

/***/ "./src/app/components/clients/edit-client/edit-client.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/clients/edit-client/edit-client.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n  edit-client works!\n</p>\n"

/***/ }),

/***/ "./src/app/components/clients/edit-client/edit-client.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return EditClientComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var EditClientComponent = /** @class */ (function () {
    function EditClientComponent() {
    }
    EditClientComponent.prototype.ngOnInit = function () {
    };
    EditClientComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-edit-client',
            template: __webpack_require__("./src/app/components/clients/edit-client/edit-client.component.html"),
            styles: [__webpack_require__("./src/app/components/clients/edit-client/edit-client.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], EditClientComponent);
    return EditClientComponent;
}());



/***/ }),

/***/ "./src/app/components/clients/view-client/view-client.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/clients/view-client/view-client.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"row\" *ngIf=\" client\">\n  <div class=\"col-lg-12\">\n    <h1 class=\"page-header\">\n                      Client View: <small>{{client.Name}} </small>\n                  </h1>\n    <ol class=\"breadcrumb\">\n      <li >\n        <i class=\"fa fa-dashboard\"></i> Dashboard\n      </li>\n      <li >\n          <i class=\"fa fa-dashboard\"></i> Client Manager\n        </li>\n      <li class=\"active\">\n          <i class=\"fa fa-dashboard\"></i> View Client\n        </li>\n    </ol>\n  </div>\n</div>\n<div class=\"col-sm-12 page-title\">\n    <hr style=\"width:100%; color:#72002f; background:#72002f;\">\n    <div class=\"col-sm-12\">\n        <div class=\"col-sm-2\">\n        <h2 class=\"text-al--center\" *ngIf=\"client\">{{client.Name}}<br> <small>Client Name</small></h2>\n        </div>\n        <div class=\"col-sm-2\">\n        <h2 class=\"text-al--center\" *ngIf=\"client\">{{client.Address}}<br><small>Client Address</small></h2>\n        </div>\n        <div class=\"col-sm-2\">\n          <h2 class=\"text-al--center\" *ngIf=\"client\">{{client.MobileTel}}<br><small>Mobile Number</small></h2>\n      </div>\n      <div class=\"col-sm-2\">\n        <h2 class=\"text-al--center\" *ngIf=\"client\">{{client.OfficeTel}}<br><small>Office Number</small></h2>\n        </div>\n        <div class=\"col-sm-4\">\n        <h2 class=\"text-al--center\" *ngIf=\"client\">{{client.Email}}<br><small>Email Address</small>\n        </h2>\n       \n        \n    </div> <hr style=\"width:100%; color:#72002f; background:#72002f;\">\n    <div class=\"col-sm-12\">\n            <div class=\"form-group\">\n                    <h2>Search Client Projects</h2>\n                    <input type=\"text\" class=\"searchTerm\" placeholder=\"Search clients\" name=\"query\" [(ngModel)]=\"query\" required #searchEntry=\"ngModel\">\n               </div> \n    </div>\n</div>\n</div><br>\n<div class=\"row\">\n  <ngb-tabset><ngb-tab  title=\"Pending\" class=\"active\">\n    <ng-template ngbTabContent>\n      <div class=\"table-responsive\">          \n          <table class=\"table table-striped\">\n            <thead>\n              <tr>\n                \n                <th>#</th>\n                <th>Title</th>\n                <th>Creator</th>\n  \n                <th>Completion(%)</th>\n                <th>Actions</th>\n              </tr>\n            </thead>\n            <tbody>\n              <tr *ngFor=\"let pro of (projects |orderBy:'ref')| search:query;  index as i\" [hidden]=\"pro.Services.stages[0].completed\">\n                <td class=\"text-al--left\">{{pro.ref}}</td>\n                <td class=\"text-al--left\">{{pro.title}}</td>\n            <!--    <td class=\"text-al--left\">{{pro.creationDate.getDay()}}/{{pro.creationDate.getMonth()}}/{{pro.creationDate.getFullYear()}}</td>\n            -->     <td class=\"text-al--left\"> {{pro.createdBy}}</td>\n                <td class=\"text-al--left\">{{pro.projectProgress.toFixed(2)}}%</td>\n                <td class=\"text-al--left\">\n                      <button class=\"btn btn-primary\" (click)=\"viewProject(i)\" matTooltip=\"View Project\"><i class=\"glyphicon glyphicon-eye-open\"></i></button>\n                    <button class=\"btn btn-action\" matTooltip=\"Edit Project Details(NOT AVAILABLE YET)\"><i class=\"glyphicon glyphicon-edit\" ></i></button>\n                    <button class=\"btn btn-action\" (click)=\"toggleRemoveModal(i)\" matTooltip=\"Delete Project\"><i class=\"glyphicon glyphicon-remove\"></i></button>\n                </td>\n              </tr>\n            </tbody>\n          </table>\n          </div>\n      \n    </ng-template>\n  </ngb-tab>\n      <ngb-tab  title=\"Active\">\n        <ng-template ngbTabContent>\n          <div class=\"table-responsive\">          \n              <table class=\"table table-striped\">\n                <thead>\n                  <tr>\n                    \n                    <th>#</th>\n                    <th>Title</th>\n                    <th>Creator</th>\n  \n                    <th>Completion(%)</th>\n                    <th>Actions</th>\n                  </tr>\n                </thead>\n                <tbody>\n                  <tr *ngFor=\"let pro of (projects |orderBy:'ref')| search:query;  index as i\" [hidden]=\"pro.projectComplete|| !pro.Services.stages[0].completed\">\n                    <td class=\"text-al--left\">{{pro.ref}}</td>\n                    <td class=\"text-al--left\">{{pro.title}}</td>\n                <!--    <td class=\"text-al--left\">{{pro.creationDate.getDay()}}/{{pro.creationDate.getMonth()}}/{{pro.creationDate.getFullYear()}}</td>\n                -->     <td class=\"text-al--left\"> {{pro.createdBy}}</td>\n                    <td class=\"text-al--left\">{{pro.projectProgress.toFixed(2)}}%</td>\n                    <td class=\"text-al--left\">\n                          <button class=\"btn btn-primary\" (click)=\"viewProject(i)\" matTooltip=\"View Project\"><i class=\"glyphicon glyphicon-eye-open\"></i></button>\n                        <button class=\"btn btn-action\" matTooltip=\"Edit Project Details(NOT AVAILABLE YET)\"><i class=\"glyphicon glyphicon-edit\" ></i></button>\n                        <button class=\"btn btn-action\" (click)=\"toggleRemoveModal(i)\" matTooltip=\"Delete Project\"><i class=\"glyphicon glyphicon-remove\"></i></button>\n                    </td>\n                  </tr>\n                </tbody>\n              </table>\n              </div>\n          \n        </ng-template>\n      </ngb-tab>\n     \n      <ngb-tab id=\"complete-proj\" title=\"Complete\">\n        <ng-template ngbTabContent>\n          <div class=\"table-responsive\">          \n              <table class=\"table table-striped\">\n                <thead>\n                    <tr>\n                    \n                        <th>#</th>\n                        <th>Title</th>\n                        <th>Creator</th>\n      \n                        <th>Completion(%)</th>\n                        <th>Actions</th>\n                      </tr>\n                </thead>\n                <tbody>\n                    <tr *ngFor=\"let pro of (projects |orderBy:'ref')| search:query; index as i\" [hidden]=\"!pro.projectComplete\">\n                      <td class=\"text-al--left\">{{pro.ref}}</td>\n                      <td class=\"text-al--left\">{{pro.title}}</td>\n                  <!--    <td class=\"text-al--left\">{{pro.creationDate.getDay()}}/{{pro.creationDate.getMonth()}}/{{pro.creationDate.getFullYear()}}</td>\n                  -->     <td class=\"text-al--left\"> {{pro.createdBy}}</td>\n                      <td class=\"text-al--left\">{{pro.projectProgress.toFixed(2)}}%</td>\n                      <td class=\"text-al--left\">\n                            <button class=\"btn btn-primary\" (click)=\"viewProject(i)\" matTooltip=\"View Project\"><i class=\"glyphicon glyphicon-eye-open\"></i></button>\n                          <button class=\"btn btn-action\" matTooltip=\"Edit Project Details(NOT AVAILABLE YET)\"><i class=\"glyphicon glyphicon-edit\" ></i></button>\n                          <button class=\"btn btn-action\" (click)=\"toggleRemoveModal(i)\" matTooltip=\"Delete Project\"><i class=\"glyphicon glyphicon-remove\"></i></button>\n                      </td>\n                    </tr>\n                  </tbody>\n              </table>\n              </div>\n        </ng-template>\n      </ngb-tab>\n    </ngb-tabset>\n  </div>\n  <div id=\"RemoveProjModal\" class=\"FormModal\" >\n          <h1>Remove Project<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n        </i></h1>\n        \n          <form #l=\"ngForm\" >\n           \n            <div class=\"form-group col-sm-12\"><p>Are you sure you would like to remove this project?</p> \n             \n          </div>   \n          <button class=\"btn btn-primary\" (click)=\"removeProject()\"> Remove</button>\n          <button class=\"btn btn-action\" (click)=\"toggleRemoveModal()\"> Cancel</button>\n          </form>\n          </div>"

/***/ }),

/***/ "./src/app/components/clients/view-client/view-client.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ViewClientComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var ViewClientComponent = /** @class */ (function () {
    function ViewClientComponent(validateService, flashMessages, authService, router, route, modalService, zone // <== added
    ) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.route = route;
        this.modalService = modalService;
        this.zone = zone; // <== added
    }
    ViewClientComponent.prototype.makeRef = function (i) {
        return ("0000" + (i)).slice(-4);
    };
    ViewClientComponent.prototype.ngOnInit = function () {
        var _this = this;
        var id = this.route.snapshot.params['id'];
        this.authService.getOneClient(id).subscribe(function (client) {
            _this.client = client.client[0];
            // console.log(this.client);
            _this.authService.getProjectsbyClient(_this.client._id).subscribe(function (data) {
                _this.projects = data.project;
                //   console.log(this.projects);
            }, function (err) {
                //   console.log(err);
                return false;
            });
        }, function (err) {
            //  console.log(err);
            _this.router.navigate(['/projects']);
            return false;
        });
    };
    ViewClientComponent.prototype.viewProject = function (i) {
        //  console.log(i);
        this.router.navigate(['/projects', this.projects[i].ref]);
    };
    ViewClientComponent.prototype.removeProject = function () {
        var _this = this;
        this.authService.removeProject(this.projects[this.proj_i]._id).subscribe(function (data) {
            //   console.log(data);
            _this.flashMessages.show('Removing project was successful!', { cssClass: 'alert-success', timeout: 3000 });
            _this.closeModal();
            _this.ngOnInit();
            _this.router.navigate(['/projects']);
        }, function (err) {
            //   console.log(err);
            _this.flashMessages.show('Removing project was not successful!', { cssClass: 'alert-danger', timeout: 3000 });
            return false;
        });
    };
    ViewClientComponent.prototype.toggleRemoveModal = function (i) {
        this.proj_i = i;
        if (document.getElementById("RemoveProjModal").style.opacity == "1") {
            document.getElementById("RemoveProjModal").style.opacity = "0";
            document.getElementById("RemoveProjModal").style.display = "none";
        }
        else {
            document.getElementById("RemoveProjModal").style.display = "block";
            document.getElementById("RemoveProjModal").style.opacity = "1";
        }
    };
    ViewClientComponent.prototype.closeModal = function () {
        document.getElementById("RemoveProjModal").style.opacity = "0";
        document.getElementById("RemoveProjModal").style.display = "none";
    };
    ViewClientComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-view-client',
            template: __webpack_require__("./src/app/components/clients/view-client/view-client.component.html"),
            styles: [__webpack_require__("./src/app/components/clients/view-client/view-client.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["a" /* ActivatedRoute */],
            __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */],
            __WEBPACK_IMPORTED_MODULE_0__angular_core__["NgZone"] // <== added
        ])
    ], ViewClientComponent);
    return ViewClientComponent;
}());



/***/ }),

/***/ "./src/app/components/company/add-company/add-company.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/company/add-company/add-company.component.html":
/***/ (function(module, exports) {

module.exports = "<form #f=\"ngForm\" (ngSubmit)=\"onCompanySubmit(f)\">\n\n  <h1 class=\"center\">Register Company</h1>\n  <div class=\"col-sm-6 left\">\n  <div class=\"form-group\">\n    <label for=\"inputName\">Company Name</label>\n   <input type=\"text\" class=\"form-control\" id=\"inputName\" name=\"compname\" ngModel required #compname=\"ngModel\">\n  </div>\n  <div class=\"form-group\">\n    <label for=\"inputEmail\">Email address</label>\n    <input type=\"email\" class=\"form-control\" id=\"inputEmail\" aria-describedby=\"emailHelp\"   name=\"email\" ngModel required #email=\"ngModel\">\n    <small id=\"emailHelp\" class=\"form-text text-muted\">We'll never share your email with anyone else.</small>\n  </div> \n  <div class=\"form-group\">\n    <label for=\"inputWebsite\">Website:</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputWebsite\" name=\"website\" ngModel required #website=\"ngModel\">\n  </div>\n  <div class=\"form-group\">\n    <label for=\"inputReg\">Registration Number:</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"companyRegNum\" ngModel required #companyRegNum=\"ngModel\">\n  </div>\n  </div>\n   <div class=\"col-sm-6 right\">\n     <div class=\"form-group\">\n    <label for=\"inputPhone\">Phone Number</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputPhone\"  name=\"phone\" ngModel required #phone=\"ngModel\">\n  </div>\n      <div class=\"form-group\">\n    <label for=\"inputAddress\">Address Line 1</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputAddress\" name=\"street\" ngModel required #street=\"ngModel\">\n  </div>\n   <div class=\"form-group\">\n    <label for=\"inputTown\">Town</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputTown\"  name=\"town\" ngModel required #town=\"ngModel\">\n  </div>\n   <div class=\"form-group\">\n    <label for=\"inputCounty\">County</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputCounty\" name=\"county\" ngModel required #county=\"ngModel\">\n  </div>\n   <div class=\"form-group\">\n    <label for=\"inputCountry\">Country</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputCountry\" name=\"country\" ngModel required #country=\"ngModel\">\n  </div>\n  \n  \n   </div>\n   <div class=\"col-md-12\">\n    <h4 class=\"text-al--center\">Your Job Role</h4>\n    <div class=\"col-md-6\">\n         <label for=\"inputCountry\">Access Allowance:</label>\n      <select name=\"empType\" ngModel required #empType=\"ngModel\">\n  <option value=\"Admin\">Admin</option>\n  <option value=\"Employee\">Employee</option>\n</select></div>\n    <div class=\"col-md-6\">\n      <div class=\"form-group\">\n    <label for=\"inputCountry\">Your Job Position</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputCountry\" name=\"empPosition\" ngModel required #empPosition=\"ngModel\" >\n  </div>\n    </div>\n  </div>\n   <input type=\"submit\" class=\" col-sm-12 btn btn-default\" value=\"Register Company\" name=\"country\" ngModel required #country=\"ngModel\">\n</form>\n"

/***/ }),

/***/ "./src/app/components/company/add-company/add-company.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AddCompanyComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var AddCompanyComponent = /** @class */ (function () {
    function AddCompanyComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
    }
    AddCompanyComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.authService.getProfile().subscribe(function (profile) {
            _this.user = profile.user;
            console.log(profile);
        }, function (err) {
            console.log(err);
            return false;
        });
    };
    AddCompanyComponent.prototype.onCompanySubmit = function (f) {
        var _this = this;
        console.log(f.value);
        var company = {
            name: f.value.compname,
            street: f.value.street,
            town: f.value.town,
            county: f.value.county,
            country: f.value.country,
            website: f.value.website,
            email: f.value.email,
            companyRegNum: f.value.companyRegNum,
            phone: f.value.phone,
            employees: {
                empId: this.user._id,
                empName: this.user.fullname,
                empPosition: f.value.empPosition,
                empType: f.value.empType
            }
        };
        console.log(company);
        if (!this.validateService.ValidateCompRegister(company)) {
            console.log('Please fill in all fields');
            this.flashMessages.show('Please fill in all the fields', { cssClass: 'alert-danger', timeout: 3000 });
        }
        if (!this.validateService.ValidateEmail(company.email)) {
            console.log('Please use a valid email address');
            this.flashMessages.show('Please use a valid email address', { cssClass: 'alert-danger', timeout: 3000 });
        }
        this.authService.registerCompany(company).subscribe(function (data) {
            if (data.success) {
                var iddd = data.company;
                console.log(data.company);
                _this.flashMessages.show('Your company is now registered ', { cssClass: 'alert-success', timeout: 3000 });
                _this.router.navigate(['ViewCompany']);
            }
            else {
                console.log(data);
                _this.flashMessages.show('Something went wrong, you are not registered. Please try again!', { cssClass: 'alert-danger', timeout: 3000 });
                _this.router.navigate(['AddCompany']);
            }
        });
    };
    AddCompanyComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-add-company',
            template: __webpack_require__("./src/app/components/company/add-company/add-company.component.html"),
            styles: [__webpack_require__("./src/app/components/company/add-company/add-company.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_3__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]])
    ], AddCompanyComponent);
    return AddCompanyComponent;
}());



/***/ }),

/***/ "./src/app/components/company/company.component.css":
/***/ (function(module, exports) {

module.exports = "\r\n@import url(https://fonts.googleapis.com/css?family=Open+Sans);\r\n\r\nbody{\r\n  background: #f2f2f2;\r\n  font-family: 'Open Sans', sans-serif;\r\n}\r\n\r\n.search {\r\n  width: 100%;\r\n  position: relative\r\n}\r\n\r\n.searchTerm {\r\n  float: left;\r\n  width: calc(100% - 40px);\r\n  border: 3px solid #72002f;\r\n  padding: .5em;\r\n  height: 40px;\r\n   border-bottom-left-radius: 4px;\r\n  border-top-left-radius: 4px;\r\n  outline: none;\r\n  color: #9DBFAF;\r\n}\r\n\r\n.searchTerm:focus{\r\n  color: #00B4CC;\r\n}\r\n\r\n.searchButton {\r\n  position: relative;  \r\n  right: 0px;\r\n  width: 40px;\r\n  height: 40px;\r\n  border: 1px solid #72002f;\r\n  background: #72002f;\r\n  text-align: center;\r\n  color: #fff;\r\n  border-bottom-right-radius: 4px;\r\n  border-top-right-radius: 4px;\r\n  cursor: pointer;\r\n  font-size: 20px;\r\n}\r\n\r\n/*Resize the wrap to see the search bar change!*/\r\n\r\n.wrap{\r\n  width: 30%;\r\n  position: absolute;\r\n  top: 50%;\r\n  left: 50%;\r\n  -webkit-transform: translate(-50%, -50%);\r\n          transform: translate(-50%, -50%);\r\n}"

/***/ }),

/***/ "./src/app/components/company/company.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"searchCompany\" *ngIf=\"!isCompanyRegistered()\">\n\n  <form #f=\"ngForm\" (ngSubmit)=\"onCompanySearchSubmit(f)\" *ngIf=\"!isCompaniesSearched()\">\n      <div class=\"wrap\">\n          <h4 class=\"text-al--center\">You have not assigned your company to your profile. Please search for your company below.</h4>\n          <div class=\"search\">\n              <input type=\"text\" class=\"searchTerm\" placeholder=\"Search for your company\" name=\"searchEntry\" ngModel required #searchEntry=\"ngModel\">\n              <button type=\"submit\" class=\"searchButton\">\n                <i class=\"glyphicon glyphicon-search\"></i>\n            </button>\n          </div>\n       </div>\n\n       <div class=\"col-sm-12\" *ngIf=\"!isListEmpty()\">\n           <ul>\n              \n           </ul>\n       </div>\n  </form>\n\n  <h4 class=\"text-al--center\" *ngIf=\"isListEmpty()\">The company you are looking for does not exist. Please register company by clicking <a [routerLink]=\"'/AddCompany'\">here</a> and follow instructions.</h4>\n  <div class=\"col-sm-12\" *ngIf=\"isCompaniesSearched()\">\n      <h1>Company List</h1>\n     <table id=\"example\" class=\"table table-striped table-bordered\" cellspacing=\"0\" width=\"100%\">\n        <thead>\n            <tr>\n                <th>Name</th>\n                <th>Address</th>\n                <th>Registration Number</th>\n                <th>Email</th>\n                <th>Actions</th>\n              \n            </tr>\n        </thead>\n        <tfoot>\n            <tr>\n                <th>Name</th>\n                <th>Address</th>\n                <th>Registration Number</th>\n                <th>Email</th>\n                 <th>Actions</th>\n            </tr>\n        </tfoot>\n        <tbody>\n            <tr *ngFor=\"let comp of companyArr index as i\" [attr.data-index]=\"i\">\n                <td>{{comp.name}}</td>\n                <td>{{comp.street}}, {{comp.town}}, {{comp.county}}</td>\n                <td>{{comp.companyRegNum}}</td>\n                <td>{{comp.email}}</td>\n                <td><a class=\"btn btn-primary\" (click)=\"joinCompany(i)\">Join Company</a> <a class=\"btn btn-primary\">View Company</a></td>\n                \n            </tr>\n        </tbody>\n    </table>\n  \n</div>\n\n\n</div>\n\n<div class=\"col-sm-12 viewCompany\" *ngIf=\"isCompanyRegistered()\">\n\n      <h1 class=\"text-al--center\">{{company.name}}</h1>\n      \n\n  <div class=\"col-sm-6\">\n     <h4>Company Address</h4>\n    <small>{{company.street}},</small>\n    <small> {{company.town}}  </small>\n    <small> {{company.county}}</small>\n    <small> {{company.country}}</small>\n  </div>\n  <div class=\"col-sm-6\">\n    <h4>Company Registration Number</h4>\n    <small> {{company.companyRegNum}}</small>\n     <h4>Company Website</h4>\n    <small> {{company.website}}</small>\n     <h4>Company Email</h4>\n    <small> {{company.email}}</small> \n    <h4>Company Contact Number</h4>\n    <small> {{company.phone}}</small>\n\n  </div>\n  <div class=\"col-11\" style=\"display:block; position:relative; margin:0 auto;\" ><hr></div>\n<div class=\"col-sm-12\">\n      <h1>Company Employees</h1>\n     <table id=\"example\" class=\"table table-striped table-bordered\" cellspacing=\"0\" width=\"100%\">\n        <thead>\n            <tr>\n                <th>Name</th>\n                <th>Position</th>\n                <th>Office</th>\n                <th>Age</th>\n                <th>Start date</th>\n                <th>Salary</th>\n            </tr>\n        </thead>\n        <tfoot>\n            <tr>\n                <th>Name</th>\n                <th>Position</th>\n                <th>Office</th>\n                <th>Age</th>\n                <th>Start date</th>\n                <th>Salary</th>\n            </tr>\n        </tfoot>\n        <tbody>\n            <tr>\n                <td>Tiger Nixon</td>\n                <td>System Architect</td>\n                <td>Edinburgh</td>\n                <td>61</td>\n                <td>2011/04/25</td>\n                <td>$320,800</td>\n            </tr>\n        </tbody>\n    </table>\n  \n</div>\n</div>"

/***/ }),

/***/ "./src/app/components/company/company.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CompanyComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var CompanyComponent = /** @class */ (function () {
    function CompanyComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
    }
    CompanyComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isEmpty = false;
        this.isSearched = false;
        this.authService.getProfile().subscribe(function (profile) {
            _this.user = profile.user;
            _this.company = profile.user.companyid;
            console.log(_this.company);
            if (_this.company == undefined)
                _this.isRegistered = false;
            else
                _this.isRegistered = true;
        }, function (err) {
            console.log(err);
            return false;
        });
    };
    CompanyComponent.prototype.isCompanyRegistered = function () {
        return this.isRegistered;
    };
    CompanyComponent.prototype.isListEmpty = function () {
        return this.isEmpty;
    };
    CompanyComponent.prototype.isCompaniesSearched = function () {
        return this.isSearched;
    };
    CompanyComponent.prototype.joinCompany = function (i) {
        console.log(this.companyArr[i]._id);
        // this.authService.addmoreUser({compid:this.companyArr[i]._id,userid:this.user._id}).subscribe(data =>{
        //   if(data.success){
        //     this.router.navigate(['dashboard']);
        //   }
        //   else{
        //     this.flashMessages.show(data.msg,{cssClass: 'alert-danger',timeout:6000});
        //   }
        // })
    };
    CompanyComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-company',
            template: __webpack_require__("./src/app/components/company/company.component.html"),
            styles: [__webpack_require__("./src/app/components/company/company.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]])
    ], CompanyComponent);
    return CompanyComponent;
}());



/***/ }),

/***/ "./src/app/components/company/view-company/view-company.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/company/view-company/view-company.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n  view-company works!\n</p>\n"

/***/ }),

/***/ "./src/app/components/company/view-company/view-company.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ViewCompanyComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ViewCompanyComponent = /** @class */ (function () {
    function ViewCompanyComponent() {
    }
    ViewCompanyComponent.prototype.ngOnInit = function () {
    };
    ViewCompanyComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-view-company',
            template: __webpack_require__("./src/app/components/company/view-company/view-company.component.html"),
            styles: [__webpack_require__("./src/app/components/company/view-company/view-company.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], ViewCompanyComponent);
    return ViewCompanyComponent;
}());



/***/ }),

/***/ "./src/app/components/confirmation-dialog/confirmation-dialog.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/confirmation-dialog/confirmation-dialog.component.html":
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Hi {{data.title}}</h1>\n<div mat-dialog-content>\n  <p>{{data.msg}}</p>\n  \n</div>\n<div mat-dialog-actions>\n  <button mat-button (click)=\"onNoClick()\">No Thanks</button>\n  <button mat-button [mat-dialog-close]=\"data.animal\" cdkFocusInitial>Ok</button>\n</div>\n"

/***/ }),

/***/ "./src/app/components/confirmation-dialog/confirmation-dialog.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ConfirmationDialogComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};


var ConfirmationDialogComponent = /** @class */ (function () {
    function ConfirmationDialogComponent(dialogRef, data) {
        this.dialogRef = dialogRef;
        this.data = data;
    }
    ConfirmationDialogComponent.prototype.onNoClick = function () {
    };
    ConfirmationDialogComponent.prototype.toggleDialog = function () {
    };
    ConfirmationDialogComponent.prototype.ngOnInit = function () {
    };
    ConfirmationDialogComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-confirmation-dialog',
            template: __webpack_require__("./src/app/components/confirmation-dialog/confirmation-dialog.component.html"),
            styles: [__webpack_require__("./src/app/components/confirmation-dialog/confirmation-dialog.component.css")]
        }),
        __param(1, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Inject"])(__WEBPACK_IMPORTED_MODULE_1__angular_material__["a" /* MAT_DIALOG_DATA */])),
        __metadata("design:paramtypes", [ConfirmationDialogComponent, Object])
    ], ConfirmationDialogComponent);
    return ConfirmationDialogComponent;
}());



/***/ }),

/***/ "./src/app/components/dashboard/dashboard.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/dashboard/dashboard.component.html":
/***/ (function(module, exports) {

module.exports = "<div id=\"page-wrapper\">\n\n    <div class=\"container-fluid\">\n\n      <!-- Page Heading -->\n      <div class=\"row\">\n        <div class=\"col-lg-12\">\n          <h1 class=\"page-header\">\n                            Dashboard <small>Statistics Overview</small>\n                        </h1>\n          <ol class=\"breadcrumb\">\n            <li class=\"active\">\n              <i class=\"fa fa-dashboard\"></i> Dashboard\n            </li>\n          </ol>\n        </div>\n      </div>\n      <!-- /.row -->\n\n      <div class=\"row\">\n        <div class=\"col-lg-3 col-md-6\">\n          <div class=\"panel panel-primary\">\n            <div class=\"panel-heading\">\n              <div class=\"row\">\n                <div class=\"col-xs-3\">\n                  <i class=\"glyphicon glyphicon-ok fa-5x\"></i>\n                </div>\n                <div class=\"col-xs-9 text-right\">\n                  <div class=\"huge\"> {{total_complete_projects}}</div>\n                  <div>Total Completed Projects</div>\n                </div>\n              </div>\n            </div>\n            <a href=\"#\">\n              <div class=\"panel-footer\">\n                <span class=\"pull-left\">View Details</span>\n                <span class=\"pull-right\"><i class=\"glyphicon glyphicon-circle-arrow-right\"></i></span>\n                <div class=\"clearfix\"></div>\n              </div>\n            </a>\n          </div>\n        </div>\n        <div class=\"col-lg-3 col-md-6\">\n          <div class=\"panel panel-green\">\n            <div class=\"panel-heading\">\n              <div class=\"row\">\n                <div class=\"col-xs-3\">\n                  <i class=\"glyphicon glyphicon-heart fa-5x\"></i>\n                </div>\n                <div class=\"col-xs-9 text-right\">\n                  <div class=\"huge\">{{total_projects}}</div>\n                  <div>Total Active Projects</div>\n                </div>\n              </div>\n            </div>\n            <a href=\"#\">\n              <div class=\"panel-footer\">\n                <span class=\"pull-left\">View Details</span>\n                <span class=\"pull-right\"><i class=\"glyphicon glyphicon-circle-arrow-right\"></i></span>\n                <div class=\"clearfix\"></div>\n              </div>\n            </a>\n          </div>\n        </div>\n        <div class=\"col-lg-3 col-md-6\" *ngIf=\"isCompany() \">\n          <div class=\"panel panel-yellow\">\n            <div class=\"panel-heading\">\n              <div class=\"row\">\n                <div class=\"col-xs-3\">\n                  <i class=\"glyphicon glyphicon-user fa-5x\"></i>\n                </div>\n                <div class=\"col-xs-9 text-right\">\n                  <div class=\"huge\">{{total_emps}}</div>\n                  <div>Total Employee's</div>\n                </div>\n              </div>\n            </div>\n            <a href=\"#\">\n              <div class=\"panel-footer\">\n                <span class=\"pull-left\">View Details</span>\n                <span class=\"pull-right\"><i class=\"glyphicon glyphicon-circle-arrow-right\"></i></span>\n                <div class=\"clearfix\"></div>\n              </div>\n            </a>\n          </div>\n        </div>\n        <div class=\"col-lg-3 col-md-6\">\n          <div class=\"panel panel-yellow\" *ngIf=\"!isCompany()\">\n            <div class=\"panel-heading\">\n              <div class=\"row\">\n                <div class=\"col-xs-3\">\n                  <i class=\"glyphicon glyphicon-inbox fa-5x\"></i>\n                </div>\n                <div class=\"col-xs-9 text-right\">\n                  <div class=\"huge\">{{total_empProjects}}</div>\n                  <div>Your active Projects</div>\n                </div>\n              </div>\n            </div>\n            <a href=\"#\">\n              <div class=\"panel-footer\">\n                <span class=\"pull-left\">View Details</span>\n                <span class=\"pull-right\"><i class=\"glyphicon glyphicon-circle-arrow-right\"></i></span>\n                <div class=\"clearfix\"></div>\n              </div>\n            </a>\n          </div>\n        </div>\n        <div class=\"col-lg-3 col-md-6\">\n          <div class=\"panel panel-red\">\n            <div class=\"panel-heading\">\n              <div class=\"row\">\n                <div class=\"col-xs-3\">\n                  <i class=\"glyphicon glyphicon-user fa-5x\"></i>\n                </div>\n                <div class=\"col-xs-9 text-right\">\n                  <div class=\"huge\">{{total_clients}}</div>\n                  <div>Total Client's</div>\n                </div>\n              </div>\n            </div>\n            <a href=\"#\">\n              <div class=\"panel-footer\">\n                <span class=\"pull-left\">View Details</span>\n                <span class=\"pull-right\"><i class=\"glyphicon glyphicon-circle-arrow-right\"></i></span>\n                <div class=\"clearfix\"></div>\n              </div>\n            </a>\n          </div>\n        </div>\n      </div>\n      <!-- /.row -->\n\n      <!-- <div class=\"row\">\n        <div class=\"col-lg-12\">\n          <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">\n              <h3 class=\"panel-title\"><i class=\"fa fa-bar-chart-o fa-fw\"></i> Area Chart</h3>\n            </div>\n            <div class=\"panel-body\">\n              <div id=\"morris-area-chart\"></div>\n            </div>\n          </div>\n        </div>\n      </div> -->\n      <!-- /.row -->\n\n      <div class=\"row\">\n        <div class=\"col-lg-4\" *ngIf=\"isCompany() && account\">\n          <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">\n              <h3 class=\"panel-title\"><i class=\"glyphicon glyphicon-user\"></i> Employee List</h3>\n            </div>\n            <div class=\"panel-body\">\n                <div class=\"list-group\">\n                    <!-- .list-item -->\n                <a  class=\"list-group-item\" *ngFor=\"let emp of account.employees | slice:0:8; let i = index\" (click)=\"viewProject(i)\">\n                  <!-- <span class=\"badge\">just now</span> -->\n                  <p>{{emp.empName}} </p> \n                </a>\n                \n              </div>\n              <div class=\"text-right\">\n                <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/employee-manager'\">View All Employees <i class=\"glyphicon glyphicon-circle-arrow-right\"></i></a>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"col-lg-4\" *ngIf=\"projects\">\n          <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">\n              <h3 class=\"panel-title\"><i class=\"glyphicon glyphicon-folder-open\"></i> Projects List</h3>\n            </div>\n            <div class=\"panel-body\">\n              <div class=\"list-group\">\n                    <!-- .list-item -->\n                <a  class=\"list-group-item\" *ngFor=\"let pro of projects | slice:0:8; let i = index\" (click)=\"viewProject(i)\">\n                  <!-- <span class=\"badge\">just now</span> -->\n                  <p>{{pro.title}} </p> \n                </a>\n                \n              </div>\n              <div class=\"text-right\">\n                <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/projects'\">View All Projects <i class=\"glyphicon glyphicon-circle-arrow-right\"></i></a>\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"col-lg-4\" *ngIf=\"clients\">\n          <div class=\"panel panel-default\">\n            <div class=\"panel-heading\">\n              <h3 class=\"panel-title\"><i class=\"glyphicon glyphicon-user\"></i> Clients List</h3>\n            </div>\n            <div class=\"panel-body\">\n              <div class=\"table-responsive\">\n                <table class=\"table table-hover table-striped\">\n                  <thead>\n                    <tr>\n                      <th>#</th>\n                      <th>Name</th>\n                      <th>Email</th>\n                      \n                \n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr *ngFor=\"let cli of clients | slice:0:8; let i = index\" (click)=\"viewClient(i)\">\n                      <td>{{i+1}}</td>\n                      <td>{{cli.Name}}</td>\n                      <td>{{cli.Email}}</td>\n                     \n                     \n                    </tr>\n                    \n                  </tbody>\n                </table>\n              </div>\n              <div class=\"text-right\">\n                <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/clients'\">View All Clients <i class=\"fa fa-arrow-circle-right\"></i></a>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n      <!-- /.row -->\n\n    </div>\n    <!-- /.container-fluid -->\n\n  </div>\n  <!-- /#page-wrapper -->\n\n"

/***/ }),

/***/ "./src/app/components/dashboard/dashboard.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DashboardComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};







var DashboardComponent = /** @class */ (function () {
    function DashboardComponent(window, validateService, flashMessages, authService, router, route, modalService, zone, // <== added
    dialog) {
        this.window = window;
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.route = route;
        this.modalService = modalService;
        this.zone = zone;
        this.dialog = dialog;
        this.total_projects = 0;
        this.total_complete_projects = 0;
        this.total_clients = 0;
        this.total_empProjects = 0;
        this.total_emps = 0;
    }
    DashboardComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.isCompany()) {
            this.authService.getCompany().subscribe(function (profile) {
                _this.account = profile.company;
                _this.total_emps = _this.account.employees.length;
                _this.authService.getProjectbyComp(_this.account._id).subscribe(function (data) {
                    _this.projects = data.project;
                    console.log(_this.projects);
                    for (var i = 0; i < _this.projects.length; i++) {
                        _this.total_projects++;
                        if (_this.projects[i].projectComplete)
                            _this.total_complete_projects++;
                        if (_this.projects[i].createdBy === _this.account.empUsername)
                            _this.total_empProjects++;
                    }
                    console.log(_this.projects);
                    _this.authService.getClients(_this.account._id).subscribe(function (profile) {
                        _this.clients = profile.client;
                        console.log(_this.clients);
                        _this.total_clients = _this.clients.length;
                        // console.log('total Proj: '+this.total_complete_projects+'\ntotal cli: '+this.total_clients+'\n project comp: '+ this.total_complete_projects);
                    }, function (err) {
                        console.log(err);
                        return false;
                    });
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
        else {
            this.authService.getProfile().subscribe(function (profile) {
                _this.account = profile.employee;
                _this.authService.getProjectbyComp(_this.account.compId).subscribe(function (data) {
                    _this.projects = data.project;
                    console.log(_this.projects);
                    for (var i = 0; i < _this.projects.length; i++) {
                        _this.total_projects++;
                        if (_this.projects[i].projectComplete)
                            _this.total_complete_projects++;
                        if (_this.projects[i].createdBy === _this.account.empUsername)
                            _this.total_empProjects++;
                    }
                    console.log(_this.projects);
                    _this.authService.getClients(_this.account.compId).subscribe(function (profile) {
                        _this.clients = profile.client;
                        _this.total_clients = _this.clients.length;
                        console.log('total Proj: ' + _this.total_complete_projects + '\ntotal cli: ' + _this.total_clients + '\n project comp: ' + _this.total_complete_projects);
                    }, function (err) {
                        console.log(err);
                        return false;
                    });
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
    };
    DashboardComponent.prototype.isCompany = function () {
        if (localStorage.getItem('isCompany') == 'true')
            return true;
        else
            return false;
    };
    DashboardComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-dashboard',
            template: __webpack_require__("./src/app/components/dashboard/dashboard.component.html"),
            styles: [__webpack_require__("./src/app/components/dashboard/dashboard.component.css")],
            providers: [
                { provide: 'Window', useValue: window }
            ]
        }),
        __param(0, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Inject"])('Window')),
        __metadata("design:paramtypes", [Window,
            __WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["a" /* ActivatedRoute */],
            __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */],
            __WEBPACK_IMPORTED_MODULE_0__angular_core__["NgZone"],
            __WEBPACK_IMPORTED_MODULE_6__angular_material__["i" /* MatDialog */]])
    ], DashboardComponent);
    return DashboardComponent;
}());



/***/ }),

/***/ "./src/app/components/employee-management/employee-management.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/employee-management/employee-management.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"row\">\n    <div class=\"col-lg-12\">\n      <h1 class=\"page-header\">\n          Employee Management <small>List Overview</small> <button class=\"btn btn-primary\" (click)=\"toggleNewEmployeeModal()\" *ngIf=\"isCompany()\"><i class=\"glyphicon glyphicon-plus\"></i> Add New Employee</button>\n                    </h1>\n      <ol class=\"breadcrumb\">\n        <li >\n          <i class=\"fa fa-dashboard\"></i> Dashboard\n        </li>\n        <li class=\"active\">\n            <i class=\"fa fa-dashboard\"></i> Employee Management\n          </li>\n      </ol>\n    </div>\n  </div>\n  <!-- /.row -->\n\n   \n    <div class=\"row\">\n      <div class=\"col-sm-12 \">\n          <div class=\"form-group\">\n            <!-- <h2>Search Projects</h2> -->\n            <p>Search and find your selected projects</p> \n            <input type=\"text\" class=\"searchTerm col-sm-6\" placeholder=\"Search employees\" name=\"query\" [(ngModel)]=\"query\" required #searchEntry=\"ngModel\">\n            <br>             \n          </div>\n        </div>\n\n    </div>\n\n<div class=\"table-responsive col-sm-12\">          \n    <table class=\"table table-striped\">\n      <thead>\n        <tr >\n          <th>#</th>\n          <th>Name</th>\n          <th>Position</th>\n          <th>Email</th>\n          <th>Action</th>\n        </tr>\n      </thead>\n      <tbody>\n        <tr *ngFor=\"let t of account.employees| employee:query; let i = index\" >\n            <td><p class=\"text-al--left\">T{{t._id}}</p> </td>\n            <td><p class=\"text-al--left\">{{t.empName}}</p> </td>\n            <td><p class=\"text-al--left\">{{t.empPosition}}</p> </td>\n            <td><p class=\"text-al--left\">{{t.empEmail}}</p> </td>\n            <td><p class=\" text-al--left\"><a class=\"btn btn-action \" (click)=\"selectEmployee(i)\" ><i class=\"glyphicon glyphicon-eye-open\"></i></a><a class=\"btn btn-action \" (click)=\"toggleRemoveModal(i)\"><i class=\"glyphicon glyphicon glyphicon-remove\" ></i></a></p></td>\n\n        </tr>\n       \n      </tbody>\n      <!-- <tfoot><tr><td class=\"text-al--left\">\n              <a class=\"btn btn-primary\" (click)=\"saveTS()\">SAVE</a>\n           </td></tr>\n          \n      </tfoot> -->\n    </table>\n    </div>\n\n    <div id=\"addEmployeeForm\" class=\"FormModal\">\n        <h1>New Employee <i class=\"glyphicon glyphicon-remove\" (click)=\"toggleNewEmployeeModal()\">\n      </i></h1>\n        <form #f=\"ngForm\" (ngSubmit)=\"onEmployeeSubmit(f)\">\n          <input type=\"text\" class=\"form-control\" id=\"InputempName\" name=\"fullname\" ngModel required #fullname=\"ngModel\" placeholder=\"Enter Full Name\" [ngStyle]=\"myStyle1\" (change)=\"myStyle1={border:checkInput(fullname.value)}\">\n          <input type=\"text\" class=\"form-control\" id=\"InputempUsername\" name=\"username\" ngModel required #username=\"ngModel\" placeholder=\"Enter UserName\" [ngStyle]=\"myStyle2\" (change)=\"myStyle2={border:checkInput(username.value)}\">\n          <input type=\"email\" class=\"form-control\" id=\"InputempEmail\" aria-describedby=\"emailHelp\" placeholder=\"Enter Email\" name=\"ememail\" ngModel required #ememail=\"ngModel\" [ngStyle]=\"myStyle3\" (change)=\"myStyle3={border:checkEmail(ememail.value)}\">\n          <input type=\"password\" class=\"form-control\" id=\"InputempPassword\" name=\"empPassword\" ngModel required #empPassword=\"ngModel\" placeholder=\"Enter Password\" [ngStyle]=\"myStyle4\" (change)=\"myStyle4={border:checkPass(empPassword.value)}\">\n          <input type=\"text\" class=\"form-control\" id=\"Inputempdob\" placeholder=\"Date of Birth\" name=\"dob\" ngModel required #dob=\"ngModel\" [ngStyle]=\"myStyle5\" (change)=\"myStyle5={border:checkDob(dob.value)}\">\n          <input type=\"text\" class=\"form-control\" id=\"inputempPosition\" placeholder=\"Enter Position\" name=\"emposition\" ngModel required #emposition=\"ngModel\" [ngStyle]=\"myStyle6\" (change)=\"myStyle6={border:checkInput(emposition.value)}\">\n          <input type=\"number\" class=\"form-control\" id=\"inputempHrRate\" placeholder=\"Enter Hourly Rate\" name=\"empHrRate\" ngModel required #empHrRate=\"ngModel\" [ngStyle]=\"myStyle7\" (change)=\"myStyle7={border:checkInput(empHrRate.value)}\">\n          <input type=\"text\" class=\"form-control\" id=\"Inputempphone\" placeholder=\"phone\" name=\"empPhone\" ngModel required #empPhone=\"ngModel\" [ngStyle]=\"myStyle8\" (change)=\"myStyle8={border:checkInput(empPhone.value)}\">\n          <input type=\"submit\" value=\"Register Employee\" />\n        </form>\n        </div>\n\n        <div id=\"RemoveEmpModal\" class=\"FormModal\" >\n          <h1>Remove Employee<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n        </i></h1>\n        \n          \n           \n            <div class=\"form-group col-sm-12\"><p>Are you sure you would like to remove this this employee?</p> \n             \n          </div>   \n          <button class=\"btn btn-primary\" (click)=\"removeEmp()\"> Remove</button>\n          <button class=\"btn btn-action\" (click)=\"toggleRemoveModal()\"> Cancel</button>\n          \n          </div>"

/***/ }),

/***/ "./src/app/components/employee-management/employee-management.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return EmployeeManagementComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var EmployeeManagementComponent = /** @class */ (function () {
    function EmployeeManagementComponent(validateService, flashMessages, authService, router, route, modalService) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.route = route;
        this.modalService = modalService;
        this.isRemoving = false;
        this.isLoggedin = false;
        this.account = [];
    }
    EmployeeManagementComponent.prototype.isCompany = function () {
        if (localStorage.getItem('isCompany') == 'true')
            return true;
        else
            return false;
    };
    EmployeeManagementComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.isCompany()) {
            this.authService.getCompany().subscribe(function (profile) {
                _this.account = profile.company;
                console.log(_this.account.employees);
            }, function (err) {
                console.log(err);
                return false;
            });
        }
        else {
            this.authService.getProfile().subscribe(function (profile) {
                _this.router.navigate(['/dashboard']);
                _this.flashMessages.show('You have no permission to view this page! You have been redirected to Dashboard.', { cssClass: 'alert-danger', timeout: 3000 });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
    };
    EmployeeManagementComponent.prototype.toggleNewEmployeeModal = function () {
        if (document.getElementById("addEmployeeForm").style.opacity == "1") {
            document.getElementById("addEmployeeForm").style.opacity = "0";
            document.getElementById("addEmployeeForm").style.display = "none";
        }
        else {
            document.getElementById("addEmployeeForm").style.display = "block";
            document.getElementById("addEmployeeForm").style.opacity = "1";
        }
    };
    EmployeeManagementComponent.prototype.onEmployeeSubmit = function (f) {
        var _this = this;
        console.log(f);
        var error_flag = false;
        var employee = {
            details: this.account,
            empName: f.form.value.fullname,
            empEmail: f.form.value.ememail,
            empUsername: f.form.value.username,
            empPosition: f.form.value.emposition,
            empHrRate: f.form.value.empHrRate,
            empDob: f.form.value.dob,
            empPhone: f.form.value.empPhone,
            empPassword: f.form.value.empPassword,
        };
        console.log(employee);
        //employee is unchecked/false
        //company is checked/true
        if (!this.validateService.ValidateEmployee(employee)) {
            console.log('Please fill in all fields');
            this.flashMessages.show('Please fill in all the fields', { cssClass: 'alert-danger', timeout: 3000 });
            error_flag = true;
        }
        if (!this.validateService.ValidateEmail(employee.empEmail)) {
            console.log('Please fill in all fields');
            this.flashMessages.show('Please enter valid Email Address', { cssClass: 'alert-danger', timeout: 3000 });
            error_flag = true;
        }
        if (!this.validateService.dobFormat(employee.empDob)) {
            console.log('Please fill in all fields');
            this.flashMessages.show('Please enter valid Email Address', { cssClass: 'alert-danger', timeout: 3000 });
            error_flag = true;
        }
        if (!this.validateService.ValidatePassword(employee.empPassword)) {
            console.log('Please use a valid Password');
            this.flashMessages.show('Please use a valid Password - Mixed use of UPPER CASE, LOWER CASE & NUMBERS', { cssClass: 'alert-danger', timeout: 3000 });
            error_flag = true;
        }
        for (var i = 0; i < this.account.employees.length; i++) {
            if (this.account.employees[i].empUsername === employee.empUsername) {
                console.log('Please use a valid Username');
                this.flashMessages.show('This username is already taken, please try again.', { cssClass: 'alert-danger', timeout: 3000 });
                error_flag = true;
            }
            else if (this.account.employees[i].empEmail === employee.empEmail) {
                console.log('Please use a valid Email');
                this.flashMessages.show('This Email is already taken, please try again.', { cssClass: 'alert-danger', timeout: 3000 });
                error_flag = true;
            }
        }
        if (error_flag == false) {
            this.authService.registerEmployee(employee).subscribe(function (data) {
                if (data.success) {
                    _this.flashMessages.show('New Employee Added', { cssClass: 'alert-success', timeout: 3000 });
                    _this.ngOnInit();
                    //this.router.navigate(['view-company-profile']);
                }
                else {
                    _this.flashMessages.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
                    // this.router.navigate(['']);
                }
            });
        }
    };
    EmployeeManagementComponent.prototype.closeModal = function () {
        document.getElementById("addEmployeeForm").style.opacity = "0";
        document.getElementById("addEmployeeForm").style.display = "none";
        document.getElementById("RemoveEmpModal").style.opacity = "0";
        document.getElementById("RemoveEmpModal").style.display = "none";
    };
    EmployeeManagementComponent.prototype.removeEmp = function () {
        var _this = this;
        console.log(this.emp_i);
        console.log(this.account);
        this.authService.removeEmp(this.account.employees[this.emp_i]._id, this.account._id).subscribe(function (data) {
            console.log(data);
            _this.flashMessages.show('Employee is now removed!', { cssClass: 'alert-success', timeout: 3000 });
            _this.closeModal();
            _this.ngOnInit();
        }, function (err) {
            _this.flashMessages.show('Error! Employee was not removed!', { cssClass: 'alert-danger', timeout: 3000 });
            console.log(err);
            return false;
        });
    };
    EmployeeManagementComponent.prototype.toggleRemoveModal = function (i) {
        this.emp_i = i;
        console.log(this.emp_i);
        if (document.getElementById("RemoveEmpModal").style.opacity == "1") {
            document.getElementById("RemoveEmpModal").style.opacity = "0";
            document.getElementById("RemoveEmpModal").style.display = "none";
        }
        else {
            document.getElementById("RemoveEmpModal").style.display = "block";
            document.getElementById("RemoveEmpModal").style.opacity = "1";
        }
    };
    EmployeeManagementComponent.prototype.checkPass = function (f) {
        if (!this.validateService.ValidatePassword(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    EmployeeManagementComponent.prototype.checkEmail = function (f) {
        console.log(f);
        if (!this.validateService.ValidateEmail(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    EmployeeManagementComponent.prototype.checkDob = function (f) {
        if (!this.validateService.dobFormat(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    EmployeeManagementComponent.prototype.checkInput = function (f) {
        if (!this.validateService.ValidateInput(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    EmployeeManagementComponent.prototype.selectEmployee = function (i) {
        console.log(i);
        this.router.navigate(['employees-manager', this.account.employees[i]._id]);
    };
    EmployeeManagementComponent.prototype.isLoggedIn = function () {
        if (localStorage.getItem("id_token") == null) {
            this.isLoggedin = false;
            return this.isLoggedin;
        }
        else {
            return true;
        }
    };
    EmployeeManagementComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-employee-management',
            template: __webpack_require__("./src/app/components/employee-management/employee-management.component.html"),
            styles: [__webpack_require__("./src/app/components/employee-management/employee-management.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["a" /* ActivatedRoute */],
            __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */]])
    ], EmployeeManagementComponent);
    return EmployeeManagementComponent;
}());



/***/ }),

/***/ "./src/app/components/estimates/estimates.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/estimates/estimates.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n  estimates works!\n</p>\n"

/***/ }),

/***/ "./src/app/components/estimates/estimates.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return EstimatesComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var EstimatesComponent = /** @class */ (function () {
    function EstimatesComponent() {
    }
    EstimatesComponent.prototype.ngOnInit = function () {
    };
    EstimatesComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-estimates',
            template: __webpack_require__("./src/app/components/estimates/estimates.component.html"),
            styles: [__webpack_require__("./src/app/components/estimates/estimates.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], EstimatesComponent);
    return EstimatesComponent;
}());



/***/ }),

/***/ "./src/app/components/home/home.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/home/home.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n  home works!\n</p>\n"

/***/ }),

/***/ "./src/app/components/home/home.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomeComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var HomeComponent = /** @class */ (function () {
    function HomeComponent() {
    }
    HomeComponent.prototype.ngOnInit = function () {
    };
    HomeComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-home',
            template: __webpack_require__("./src/app/components/home/home.component.html"),
            styles: [__webpack_require__("./src/app/components/home/home.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], HomeComponent);
    return HomeComponent;
}());



/***/ }),

/***/ "./src/app/components/invoice/invoice.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/invoice/invoice.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n  invoice works!\n</p>\n"

/***/ }),

/***/ "./src/app/components/invoice/invoice.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return InvoiceComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var InvoiceComponent = /** @class */ (function () {
    function InvoiceComponent() {
    }
    InvoiceComponent.prototype.ngOnInit = function () {
    };
    InvoiceComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-invoice',
            template: __webpack_require__("./src/app/components/invoice/invoice.component.html"),
            styles: [__webpack_require__("./src/app/components/invoice/invoice.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], InvoiceComponent);
    return InvoiceComponent;
}());



/***/ }),

/***/ "./src/app/components/login/login.component.css":
/***/ (function(module, exports) {

module.exports = "\r\n.tgl {\r\n    display: none;\r\n  }\r\n  .tgl, .tgl:after, .tgl:before, .tgl *, .tgl *:after, .tgl *:before, .tgl + .tgl-btn {\r\n    -webkit-box-sizing: border-box;\r\n            box-sizing: border-box;\r\n  }\r\n  .tgl::-moz-selection, .tgl:after::-moz-selection, .tgl:before::-moz-selection, .tgl *::-moz-selection, .tgl *:after::-moz-selection, .tgl *:before::-moz-selection, .tgl + .tgl-btn::-moz-selection {\r\n    background: none;\r\n  }\r\n  .tgl::selection, .tgl:after::selection, .tgl:before::selection, .tgl *::selection, .tgl *:after::selection, .tgl *:before::selection, .tgl + .tgl-btn::selection {\r\n    background: none;\r\n  }\r\n  .tgl + .tgl-btn {\r\n    outline: 0;\r\n    display: block;\r\n    width: 8em;\r\n    height: 2em;\r\n    position: relative;\r\n    cursor: pointer;\r\n    -webkit-user-select: none;\r\n       -moz-user-select: none;\r\n        -ms-user-select: none;\r\n            user-select: none;\r\n  }\r\n  .tgl + .tgl-btn:after, .tgl + .tgl-btn:before {\r\n    position: relative;\r\n    display: block;\r\n    content: \"\";\r\n    width: 50%;\r\n    height: 100%;\r\n  }\r\n  .tgl + .tgl-btn:after {\r\n    left: 0;\r\n  }\r\n  .tgl + .tgl-btn:before {\r\n    display: none;\r\n  }\r\n  .tgl:checked + .tgl-btn:after {\r\n    left: 50%;\r\n  }\r\n  .tgl-skewed + .tgl-btn {\r\n    overflow: hidden;\r\n    -webkit-transform: skew(-10deg);\r\n            transform: skew(-10deg);\r\n    -webkit-backface-visibility: hidden;\r\n            backface-visibility: hidden;\r\n    -webkit-transition: all .2s ease;\r\n    transition: all .2s ease;\r\n    font-family: sans-serif;\r\n    background: rgb(0, 144, 180);\r\n  }\r\n  .tgl-skewed + .tgl-btn:after, .tgl-skewed + .tgl-btn:before {\r\n    -webkit-transform: skew(10deg);\r\n            transform: skew(10deg);\r\n    display: inline-block;\r\n    -webkit-transition: all .2s ease;\r\n    transition: all .2s ease;\r\n    width: 100%;\r\n    text-align: center;\r\n    position: absolute;\r\n    line-height: 2em;\r\n    font-weight: bold;\r\n    color: #fff;\r\n    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);\r\n  }\r\n  .tgl-skewed + .tgl-btn:after {\r\n    left: 100%;\r\n    content: attr(data-tg-on);\r\n  }\r\n  .tgl-skewed + .tgl-btn:before {\r\n    left: 0;\r\n    content: attr(data-tg-off);\r\n  }\r\n  .tgl-skewed + .tgl-btn:active {\r\n    background: rgb(0, 144, 180);\r\n  }\r\n  .tgl-skewed + .tgl-btn:active:before {\r\n    left: -10%;\r\n  }\r\n  .tgl-skewed:checked + .tgl-btn {\r\n    background: #72002f;\r\n  }\r\n  .tgl-skewed:checked + .tgl-btn:before {\r\n    left: -100%;\r\n  }\r\n  .tgl-skewed:checked + .tgl-btn:after {\r\n    left: 0;\r\n  }\r\n  .tgl-skewed:checked + .tgl-btn:active:after {\r\n    left: 10%;\r\n  }"

/***/ }),

/***/ "./src/app/components/login/login.component.html":
/***/ (function(module, exports) {

module.exports = "<h1>Login</h1>\n<form #f=\"ngForm\" (ngSubmit)=\"onLoginSubmit(f)\">\n  <div class=\"form-group\">\n      \n    <input class=\"tgl tgl-skewed\" id=\"cb3\" type=\"checkbox\" name=\"mtoggle\" [(ngModel)]=\"mtoggle\" ngModel required  checked/>\n    <label class=\"tgl-btn\" data-tg-off=\"Employee\" data-tg-on=\"Company\" for=\"cb3\"> </label>\n  </div>\n  <div class=\"form-group\">\n    <label for=\"InputUsername\">Company/Employee Name</label>\n    <input type=\"text\" class=\"form-control\" id=\"Inputname\" name=\"logname\" [(ngModel)]=\"logname\" required placeholder=\"Enter Name\">\n  </div>\n  <div class=\"form-group\">\n    <label for=\"InputPassword\">Password</label>\n    <input type=\"password\" class=\"form-control\" name=\"password\" ngModel required #password=\"ngModel\" id=\"InputPassword\" placeholder=\"Enter Password\">\n  </div><input type=\"submit\" class=\"btn btn-default\" value=\"Login\">\n</form>\n"

/***/ }),

/***/ "./src/app/components/login/login.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LoginComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var LoginComponent = /** @class */ (function () {
    function LoginComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
    }
    LoginComponent.prototype.ngOnInit = function () {
        this.mtoggle = false;
    };
    LoginComponent.prototype.onLoginSubmit = function (f) {
        var _this = this;
        console.log(f);
        var login = {
            username: f.form.value.logname,
            password: f.form.value.password
        };
        console.log(f.form.value);
        //employee is unchecked/false
        //company is checked/true
        console.log(this.mtoggle);
        if (!this.mtoggle) {
            this.authService.authenticateEmployee(login).subscribe(function (data) {
                console.log(data);
                if (data.success) {
                    _this.authService.storeData(data.token, false);
                    _this.flashMessages.show('You are now logged in!', { cssClass: 'alert-success', timeout: 3000 });
                    _this.router.navigate(['/dashboard']);
                }
                else {
                    console.log(data);
                    _this.flashMessages.show('Something went Wrong, Please try Again.', { cssClass: 'alert-danger', timeout: 3000 });
                    _this.router.navigate(['/login']);
                }
            });
        }
        else {
            console.log("COMP");
            this.authService.authenticateCompany(login).subscribe(function (data) {
                //console.log(data.company.employees);
                if (data.success) {
                    _this.authService.storeData(data.token, true);
                    _this.flashMessages.show('You are now logged in!', { cssClass: 'success-danger', timeout: 3000 });
                    _this.router.navigate(['/dashboard']);
                }
                else {
                    _this.flashMessages.show('Something went Wrong. ' + data.msg, { cssClass: 'alert-danger', timeout: 3000 });
                    _this.router.navigate(['/login']);
                }
            });
        }
    };
    LoginComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-login',
            template: __webpack_require__("./src/app/components/login/login.component.html"),
            providers: [__WEBPACK_IMPORTED_MODULE_3__services_auth_service__["a" /* AuthService */]],
            styles: [__webpack_require__("./src/app/components/login/login.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_3__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]])
    ], LoginComponent);
    return LoginComponent;
}());



/***/ }),

/***/ "./src/app/components/navbar/navbar.component.css":
/***/ (function(module, exports) {

module.exports = "nav{\r\n    width:100%;\r\n    height:60px;\r\n    position:relative;\r\n    background:#72002f;\r\n}\r\n.logo{\r\n    height:100%;\r\n    width:auto;\r\n    float:left;\r\n    margin-right:2em;\r\n}\r\n.navtoggle{\r\n    position:relative;\r\n    width:60px;\r\n    height:100%;\r\n    background:#111;\r\n    float:left;\r\n}\r\n.navtoggle > span{\r\n    position: absolute;\r\n    top: 50%;\r\n    left: 50%;\r\n    -webkit-transform: translateX(-50%) translateY(-50%);\r\n            transform: translateX(-50%) translateY(-50%);\r\n    color: #72002f;\r\n    font-size: 2em;\r\n    -webkit-transform-origin: 50% -10% ;\r\n            transform-origin: 50% -10% ;\r\n}\r\n.navtoggle:hover > span{\r\n   -webkit-transform: rotate(90deg);\r\n           transform: rotate(90deg);\r\n   \r\n    font-size: 3em;\r\n}\r\nul.nav-r {\r\n    list-style-type: none;\r\n    margin: 0;\r\n    padding: 0;\r\n    height:100%;\r\n    background-color:none;\r\n    color:#fff;\r\n    float:right;\r\n}\r\nul.nav-l {\r\n    list-style-type: none;\r\n    margin: 0;\r\n    padding: 0;\r\n    height:100%;\r\n    background-color:none;\r\n    color:#fff;\r\n    float:left;\r\n}\r\nli.nav-link {\r\n    line-height:60px;\r\n    padding-right:1em;\r\n    display:inline;\r\n}\r\n.sidenav {\r\n    height: 100%;\r\n    width: 0;\r\n    position: fixed;\r\n    z-index: 1;\r\n    top: 0;\r\n    left: 0;\r\n    background-color: #111;\r\n    overflow-x: hidden;\r\n    -webkit-transition: 0.5s;\r\n    transition: 0.5s;\r\n    padding-top: 60px;\r\n}\r\n.sidenav a {\r\n    padding: 8px 8px 8px 32px;\r\n    text-decoration: none;\r\n    font-size: 25px;\r\n    color: #818181;\r\n    display: block;\r\n    -webkit-transition: 0.3s;\r\n    transition: 0.3s;\r\n}\r\n.sidenav a:hover {\r\n    color: #f1f1f1;\r\n}\r\n.profiler > a.btn{\r\n    height:40px;\r\n    min-width:80px;\r\n   text-align: center;\r\n    margin-top: .5em;\r\n    margin-bottom:.5em;\r\n    display:block;\r\n    position:relative;\r\n    padding:1em;\r\n    font-size: .8em;\r\n    text-transform: uppercase;\r\n    border:none;\r\n}\r\n.profiler >a.btn-primary{\r\n    color:#fff;\r\n    background:#72002f;\r\n    \r\n\r\n}\r\n.profiler >a.btn-primary:hover{\r\n    color:#fff;\r\n    background:#5b0026;\r\n}\r\n.sidenav .closebtn {\r\n    position: absolute;\r\n    top: 0;\r\n    right: 25px;\r\n    font-size: 36px;\r\n    margin-left: 50px;\r\n}\r\n.profiler img{\r\n    margin:1em auto;\r\n    display:block;\r\n    position:relative;\r\n    width:80%;\r\n    height:auto;\r\n    border-radius:900px;\r\n}\r\n@media screen and (max-height: 450px) {\r\n  .sidenav {padding-top: 15px;}\r\n  .sidenav a {font-size: 18px;}\r\n}"

/***/ }),

/***/ "./src/app/components/navbar/navbar.component.html":
/***/ (function(module, exports) {

module.exports = "<nav>\n\n  <div *ngIf=\"isLoggedIn()\" (click)=\"toggleNav()\" class=\"navtoggle\">\n      <span class=\"glyphicon glyphicon-option-horizontal\"></span>\n  </div>\n  <img class=\"logo\" src=\"assets/images/downeycrm.png\" alt=\"\">\n<ul class=\"nav-l\" *ngIf=\"!isLoggedIn()\">\n      <li class=\"nav-link\"  [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\"><a [routerLink]=\"'/home'\">Home</a></li>\n      <li class=\"nav-link\" [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\"><a [routerLink]=\"'/about'\">About</a></li>\n      <li class=\"nav-link\"[routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\"><a [routerLink]=\"'/feature'\">Features</a></li>\n      <li class=\"nav-link\"  [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\"><a [routerLink]=\"'/contact'\">Contact</a></li>\n  </ul>\n  <ul class=\"nav-r \">\n      <li class=\"nav-link\" *ngIf=\"!isLoggedIn()\" [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\"><a [routerLink]=\"'/login'\">Login</a></li>\n      <li class=\"nav-link\" *ngIf=\"!isLoggedIn()\" [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\"><a [routerLink]=\"'/register'\">Register</a></li>\n      <li class=\"nav-link\" *ngIf=\"isLoggedIn()\" [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\"><a href=\"#\" (click)=\"onLogoutClick()\">Log Out</a></li>\n  </ul>\n</nav>\n<div id=\"mySidenav\" class=\"sidenav\" *ngIf=\"isLoggedIn()\">\n\n  <div class=\"profiler col-sm-12\" *ngIf=\"isLoggedIn()\">\n    <img src=\"../../assets/images/defaultprofile.jpeg\" alt=\"\">\n    <h4 class=\"text-al--center\" >{{name}}</h4>\n    <!-- <h4 class=\"text-al--center\" *ngIf=\"isCompanyLogged()\">{{account.empName}}</h4> -->\n  </div>\n  <div class=\"profiler col-sm-12\" *ngIf=\"isCompanyLogged()\">\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/dashboard'\"><i class=\"glyphicon glyphicon-dashboard\"></i> Dashboard</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/view-company-profile'\"><i class=\"glyphicon glyphicon-user\"></i> Profile</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/employees-manager'\"><i class=\"glyphicon glyphicon-heart\"></i> Employee Management</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/projects'\"><i class=\"glyphicon glyphicon-folder-open\"></i> Projects</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/clients'\"><i class=\"glyphicon glyphicon-cloud\"></i> Clients</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/stages'\"><i class=\"glyphicon glyphicon-cloud\"></i> Stages</a>\n     <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/timesheets'\"><i class=\"glyphicon glyphicon-time\"></i>Timesheets</a> \n  </div>\n  <div class=\"profiler col-sm-12\" *ngIf=\"!isCompanyLogged()\">\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/dashboard'\"><i class=\"glyphicon glyphicon-dashboard\"></i> Dashboard</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/view-employee-profile'\"><i class=\"glyphicon glyphicon-user\"></i> Profile</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/projects'\"><i class=\"glyphicon glyphicon-folder-open\"></i> Projects</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/clients'\"><i class=\"glyphicon glyphicon-cloud\"></i> Clients</a>\n    <a [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"'/timesheets'\"><i class=\"glyphicon glyphicon-time\"></i>Timesheets</a> \n  </div>\n</div>\n"

/***/ }),

/***/ "./src/app/components/navbar/navbar.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NavbarComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var NavbarComponent = /** @class */ (function () {
    function NavbarComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.isLoggedin = false;
        this.isNavOpen = false;
    }
    // {1}
    NavbarComponent.prototype.ngOnInit = function () {
    };
    NavbarComponent.prototype.openNav = function () {
        document.getElementById("mySidenav").style.width = "250px";
        document.getElementById("main").style.marginLeft = "250px";
    };
    /* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
    NavbarComponent.prototype.toggleNav = function () {
        var _this = this;
        if (!this.isNavOpen) {
            if (localStorage.getItem('isCompany') == 'true') {
                this.authService.getCompany().subscribe(function (profile) {
                    _this.account = profile.company;
                    console.log(_this.account);
                    _this.name = profile.company.name;
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }
            else {
                this.authService.getProfile().subscribe(function (profile) {
                    _this.account = profile.employee;
                    _this.name = profile.employee.empName;
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }
            document.getElementById("mySidenav").style.width = "250px";
            document.getElementById("main").style.marginLeft = "250px";
            this.isNavOpen = true;
        }
        else {
            document.getElementById("mySidenav").style.width = "0";
            document.getElementById("main").style.marginLeft = "0";
            this.isNavOpen = false;
        }
    };
    NavbarComponent.prototype.isCompanyLogged = function () {
        if (localStorage.getItem('isCompany') == 'true') {
            return true;
        }
        else {
            return false;
        }
    };
    NavbarComponent.prototype.openProfile = function () {
        if (localStorage.getItem('isCompany') == 'true') {
            console.log("this");
            this.router.navigate(['/view-company-profile']);
        }
        else {
            console.log("that");
            this.router.navigate(['/view-employee-profile']);
        }
    };
    NavbarComponent.prototype.isLoggedIn = function () {
        if (localStorage.getItem("id_token") == null) {
            this.isLoggedin = false;
            return this.isLoggedin;
        }
        else {
            return true;
        }
    };
    NavbarComponent.prototype.onLogoutClick = function () {
        if (this.isNavOpen)
            this.toggleNav();
        this.authService.logout();
        this.flashMessages.show('You are logged out', {
            cssClass: 'alert-success', timeout: 3000
        });
        this.router.navigate(['/login']);
        return false;
    };
    NavbarComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-navbar',
            template: __webpack_require__("./src/app/components/navbar/navbar.component.html"),
            providers: [__WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */]],
            styles: [__webpack_require__("./src/app/components/navbar/navbar.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]])
    ], NavbarComponent);
    return NavbarComponent;
}());



/***/ }),

/***/ "./src/app/components/profile/profile.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/profile/profile.component.html":
/***/ (function(module, exports) {

module.exports = "<app-view-employee-profile *ngIf=\"isCompanyLogged()\"></app-view-employee-profile>\n<app-view-company-profile *ngIf=\"!isCompanyLogged()\"></app-view-company-profile>\n"

/***/ }),

/***/ "./src/app/components/profile/profile.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ProfileComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var ProfileComponent = /** @class */ (function () {
    function ProfileComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
    }
    ProfileComponent.prototype.ngOnInit = function () {
    };
    ProfileComponent.prototype.isCompanyLogged = function () {
        return localStorage.getItem('isCompany');
    };
    ProfileComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-profile',
            template: __webpack_require__("./src/app/components/profile/profile.component.html"),
            styles: [__webpack_require__("./src/app/components/profile/profile.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]])
    ], ProfileComponent);
    return ProfileComponent;
}());



/***/ }),

/***/ "./src/app/components/projects/create-project/create-project.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/projects/create-project/create-project.component.html":
/***/ (function(module, exports) {

module.exports = "<form #f=\"ngForm\" (ngSubmit)=\"onProjectCreate(f)\">\n\n  <h1 class=\"center\">Create New Project</h1>\n  <div class=\"col-sm-6 left\">\n  \n  <div class=\"form-group\">\n    <label for=\"inputName\">Project title</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputName\" name=\"title\" ngModel required #title=\"ngModel\">\n  </div>\n  <div class=\"form-group\">\n      <label for=\"inputName\">Client</label>\n      <select class=\"form-control\" name=\"client\" #client=\"ngModel\" ngModel >\n          \n          <option value=\"{{cli._id}}\" *ngFor=\"let cli of clients.client\" >{{cli.Name}}</option>\n      </select>\n    \n\n  </div>\n  <div class=\"form-group\">\n    <label for=\"inputEmail\">Site Address</label>\n    <input type=\"text\" class=\"form-control\" id=\"inputAddress\" name=\"address\" ngModel required #address=\"ngModel\">\n  </div> \n</div>\n<div class=\"col-sm-6 right\" *ngIf=\"stages != undefined\">\n    <div class=\"col-sm-12\" *ngFor=\"let g of stages; index as h\">\n    <ul class=\"servicegroups col-sm-12\">\n        <h4>{{g.stage_title}}</h4> \n        <li *ngFor=\"let info of g.services index as i\">\n            <p > <input type=\"checkbox\" name=\"info.isActive\" [(ngModel)]=\"info.isActive\" value=\"\">{{ info.title }} </p>\n        </li>\n        \n      </ul>\n      </div>\n</div>\n <input type=\"submit\" class=\" col-sm-12 btn btn-default\" value=\"Register\">\n</form>"

/***/ }),

/***/ "./src/app/components/projects/create-project/create-project.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CreateProjectComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__projects_component__ = __webpack_require__("./src/app/components/projects/projects.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var CreateProjectComponent = /** @class */ (function () {
    function CreateProjectComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.proj = new __WEBPACK_IMPORTED_MODULE_5__projects_component__["a" /* ProjectsComponent */](this.validateService, this.flashMessages, this.authService, this.router);
    }
    CreateProjectComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (localStorage.getItem('isCompany') == 'true') {
            this.authService.getCompany().subscribe(function (profile) {
                _this.account = profile.company;
                console.log(_this.account);
                _this.name = profile.company.name;
                _this.authService.getStages(_this.account._id).subscribe(function (profile) {
                    if (profile.stage[0]) {
                        _this.stages = profile.stage[0].stages;
                        _this.stagesClone = profile.stage[0].stages;
                        console.log(_this.account);
                        _this.name = profile.company.name;
                    }
                }, function (err) {
                    console.log(err);
                    return false;
                });
                _this.authService.getClients(_this.account._id).subscribe(function (profile) {
                    _this.clients = profile.company;
                    console.log(_this.account);
                    _this.name = profile.company.name;
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
        else {
            this.authService.getProfile().subscribe(function (profile) {
                _this.account = profile.employee;
                _this.name = profile.employee.empName;
                _this.authService.getStages(_this.account.compId).subscribe(function (profile) {
                    if (profile.stage[0]) {
                        _this.stages = profile.stage[0].stages;
                        _this.stagesClone = profile.stage[0].stages;
                        console.log(_this.stages);
                    }
                }, function (err) {
                    console.log(err);
                    return false;
                });
                _this.authService.getClients(_this.account.compId).subscribe(function (profile) {
                    _this.clients = profile;
                    console.log(_this.clients);
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
    };
    CreateProjectComponent.prototype.onProjectCreate = function (f) {
        var _this = this;
        var newProject = {
            ref: this.clients.ref,
            compId: this.account.compId,
            createdBy: this.account.empUsername,
            title: f.value.title,
            clientId: f.value.client,
            SiteAddress: f.value.address,
            Services: { stages: this.stages }
        };
        console.log(newProject);
        this.authService.addProject(newProject).subscribe(function (data) {
            if (data.success) {
                console.log(data);
                _this.flashMessages.show('Your project is now created! ' + data, { cssClass: 'alert-success', timeout: 3000 });
                _this.proj.ngOnInit();
            }
            else {
                console.log(data);
                _this.flashMessages.show('Something went wrong, project was not created. Please try again!', { cssClass: 'alert-danger', timeout: 3000 });
                //this.router.navigate(['register']);
            }
        });
    };
    CreateProjectComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-create-project',
            template: __webpack_require__("./src/app/components/projects/create-project/create-project.component.html"),
            styles: [__webpack_require__("./src/app/components/projects/create-project/create-project.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]])
    ], CreateProjectComponent);
    return CreateProjectComponent;
}());



/***/ }),

/***/ "./src/app/components/projects/projects.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/projects/projects.component.html":
/***/ (function(module, exports) {

module.exports = " <div class=\"col-sm-12\" *ngIf=\"togProject\">\n    <form #f=\"ngForm\" (ngSubmit)=\"onProjectCreate(f)\">\n\n        <h1 class=\"center\">Create New Project</h1>\n        <div class=\"col-sm-6 left\">\n        \n        <div class=\"form-group\">\n          <label for=\"inputName\">Project title</label>\n          <input type=\"text\" class=\"form-control\" id=\"inputName\" name=\"title\" ngModel required #title=\"ngModel\">\n        </div>\n        <div class=\"form-group\">\n            <label for=\"inputName\">Client</label>\n            <select class=\"form-control\" name=\"cli\" #cli=\"ngModel\" ngModel >\n                \n                <option value=\"{{cli._id}}\" *ngFor=\"let cli of clients\" >{{cli.Name}}</option>\n            </select>\n          \n      \n        </div>\n        <div class=\"form-group\">\n          <label for=\"inputEmail\">Site Address</label>\n          <input type=\"text\" class=\"form-control\" id=\"inputAddress\" name=\"address\" ngModel required #address=\"ngModel\">\n        </div> \n      </div>\n      <div class=\"col-sm-6 right\" >\n          <div class=\"col-sm-12\" *ngFor=\"let g of stages; index as h\">\n          <ul class=\"servicegroups col-sm-12\">\n              <h4>{{g.stage_title}}</h4> \n              <li *ngFor=\"let info of g.services index as i\">\n                  <p > <input type=\"checkbox\" name=\"info.isActive\" [(ngModel)]=\"info.isActive\" value=\"\">{{ info.title }} </p>\n              </li>\n              \n            </ul>\n            </div>\n      </div>\n       <input type=\"submit\" class=\" col-sm-12 btn btn-default\" value=\"Register\">\n      </form>\n </div>\n<!--\n<div class=\"col-sm-12\">\n\n    <div class=\"col-sm-6 left\">\n        <h4>Current Active Projects</h4>\n        <div class=\"col-sm-12 projectItem\" *ngFor=\"let pi of projects; let i = index\" >\n                <h4 [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"['/projects',projects[i]._id]\" >{{pi.title}}</h4>\n                <p [routerLinkActive]=\"['active']\" [routerLinkActiveOptions]=\"{exact:true}\" [routerLink]=\"['/projects',projects[i]._id]\" >{{pi.projectProgress.toFixed(2)}}%</p>\n                 <i class=\"glyphicon glyphicon-remove\" (click)=\"removeProject(i)\"></i> \n        </div>\n    </div>\n    <div class=\"col-sm-6 right\">\n            <h4>Complete Projects</h4>\n    </div>\n\n    <button class=\"btn btn-primary rounded glyphicon glyphicon-plus addProject\" (click)=\"toggleNew()\"></button>\n</div> -->\n <!-- Page Heading -->\n <div class=\"row\">\n    <div class=\"col-lg-12\">\n      <h1 class=\"page-header\">\n                        Project Manager <small>List Overview</small> <button class=\"btn btn-primary\" (click)=\"toggleNew()\" *ngIf=\"!isCompany()\"><i class=\"glyphicon glyphicon-plus\"></i> Add New Project</button>\n                    </h1>\n      <ol class=\"breadcrumb\">\n        <li >\n          <i class=\"fa fa-dashboard\"></i> Dashboard\n        </li>\n        <li class=\"active\">\n            <i class=\"fa fa-dashboard\"></i> Project Manager\n          </li>\n      </ol>\n    </div>\n  </div>\n  <!-- /.row -->\n\n   \n    <div class=\"row\">\n      <div class=\"col-sm-12 \">\n          <div class=\"form-group\">\n            <!-- <h2>Search Projects</h2> -->\n            <p>Search and find your selected projects</p> \n            <input type=\"text\" class=\"searchTerm col-sm-6\" placeholder=\"Search projects\" name=\"query\" [(ngModel)]=\"query\" required #searchEntry=\"ngModel\">\n            <br>             \n          </div>\n        </div>\n\n    </div>\n<div class=\"row\">\n<ngb-tabset><ngb-tab  title=\"Pending\" class=\"active\">\n  <ng-template ngbTabContent>\n    <div class=\"table-responsive\">          \n        <table class=\"table table-striped\">\n          <thead>\n            <tr>\n              \n              <th>#</th>\n              <th>Title</th>\n              <th>Creator</th>\n\n              <th>Completion(%)</th>\n              <th>Actions</th>\n            </tr>\n          </thead>\n          <tbody>\n            <tr *ngFor=\"let pro of (projects |orderBy:'ref')| search:query;  index as i\" [hidden]=\"pro.Services.stages[0].completed\">\n              <td class=\"text-al--left\">{{pro.ref}}</td>\n              <td class=\"text-al--left\">{{pro.title}}</td>\n          <!--    <td class=\"text-al--left\">{{pro.creationDate.getDay()}}/{{pro.creationDate.getMonth()}}/{{pro.creationDate.getFullYear()}}</td>\n          -->     <td class=\"text-al--left\"> {{pro.createdBy}}</td>\n              <td class=\"text-al--left\">{{pro.projectProgress.toFixed(2)}}%</td>\n              <td class=\"text-al--left\">\n                    <button class=\"btn btn-primary\" (click)=\"viewProject(i)\" matTooltip=\"View Project\"><i class=\"glyphicon glyphicon-eye-open\"></i></button>\n                  <button class=\"btn btn-action\" matTooltip=\"Edit Project Details(NOT AVAILABLE YET)\"><i class=\"glyphicon glyphicon-edit\" ></i></button>\n                  <button class=\"btn btn-action\" (click)=\"toggleRemoveModal(i)\" matTooltip=\"Delete Project\"><i class=\"glyphicon glyphicon-remove\"></i></button>\n              </td>\n            </tr>\n          </tbody>\n        </table>\n        </div>\n    \n  </ng-template>\n</ngb-tab>\n    <ngb-tab  title=\"Active\">\n      <ng-template ngbTabContent>\n        <div class=\"table-responsive\">          \n            <table class=\"table table-striped\">\n              <thead>\n                <tr>\n                  \n                  <th>#</th>\n                  <th>Title</th>\n                  <th>Creator</th>\n\n                  <th>Completion(%)</th>\n                  <th>Actions</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr *ngFor=\"let pro of (projects |orderBy:'ref')| search:query;  index as i\" [hidden]=\"pro.projectComplete|| !pro.Services.stages[0].completed\">\n                  <td class=\"text-al--left\">{{pro.ref}}</td>\n                  <td class=\"text-al--left\">{{pro.title}}</td>\n              <!--    <td class=\"text-al--left\">{{pro.creationDate.getDay()}}/{{pro.creationDate.getMonth()}}/{{pro.creationDate.getFullYear()}}</td>\n              -->     <td class=\"text-al--left\"> {{pro.createdBy}}</td>\n                  <td class=\"text-al--left\">{{pro.projectProgress.toFixed(2)}}%</td>\n                  <td class=\"text-al--left\">\n                        <button class=\"btn btn-primary\" (click)=\"viewProject(i)\" matTooltip=\"View Project\"><i class=\"glyphicon glyphicon-eye-open\"></i></button>\n                      <button class=\"btn btn-action\" matTooltip=\"Edit Project Details(NOT AVAILABLE YET)\"><i class=\"glyphicon glyphicon-edit\" ></i></button>\n                      <button class=\"btn btn-action\" (click)=\"toggleRemoveModal(i)\" matTooltip=\"Delete Project\"><i class=\"glyphicon glyphicon-remove\"></i></button>\n                  </td>\n                </tr>\n              </tbody>\n            </table>\n            </div>\n        \n      </ng-template>\n    </ngb-tab>\n   \n    <ngb-tab id=\"complete-proj\" title=\"Complete\">\n      <ng-template ngbTabContent>\n        <div class=\"table-responsive\">          \n            <table class=\"table table-striped\">\n              <thead>\n                  <tr>\n                  \n                      <th>#</th>\n                      <th>Title</th>\n                      <th>Creator</th>\n    \n                      <th>Completion(%)</th>\n                      <th>Actions</th>\n                    </tr>\n              </thead>\n              <tbody>\n                  <tr *ngFor=\"let pro of (projects |orderBy:'ref')| search:query; index as i\" [hidden]=\"!pro.projectComplete\">\n                    <td class=\"text-al--left\">{{pro.ref}}</td>\n                    <td class=\"text-al--left\">{{pro.title}}</td>\n                <!--    <td class=\"text-al--left\">{{pro.creationDate.getDay()}}/{{pro.creationDate.getMonth()}}/{{pro.creationDate.getFullYear()}}</td>\n                -->     <td class=\"text-al--left\"> {{pro.createdBy}}</td>\n                    <td class=\"text-al--left\">{{pro.projectProgress.toFixed(2)}}%</td>\n                    <td class=\"text-al--left\">\n                          <button class=\"btn btn-primary\" (click)=\"viewProject(i)\" matTooltip=\"View Project\"><i class=\"glyphicon glyphicon-eye-open\"></i></button>\n                        <button class=\"btn btn-action\" matTooltip=\"Edit Project Details(NOT AVAILABLE YET)\"><i class=\"glyphicon glyphicon-edit\" ></i></button>\n                        <button class=\"btn btn-action\" (click)=\"toggleRemoveModal(i)\" matTooltip=\"Delete Project\"><i class=\"glyphicon glyphicon-remove\"></i></button>\n                    </td>\n                  </tr>\n                </tbody>\n            </table>\n            </div>\n      </ng-template>\n    </ngb-tab>\n  </ngb-tabset>\n</div>\n<div id=\"RemoveProjModal\" class=\"FormModal\" >\n        <h1>Remove Project<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n      </i></h1>\n      \n        <form #l=\"ngForm\" >\n         \n          <div class=\"form-group col-sm-12\"><p>Are you sure you would like to remove this project?</p> \n           \n        </div>   \n        <button class=\"btn btn-primary\" (click)=\"removeProject()\"> Remove</button>\n        <button class=\"btn btn-action\" (click)=\"toggleRemoveModal()\"> Cancel</button>\n        </form>\n        </div>"

/***/ }),

/***/ "./src/app/components/projects/projects.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ProjectsComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var ProjectsComponent = /** @class */ (function () {
    function ProjectsComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.togProject = false;
    }
    ProjectsComponent.prototype.isCompany = function () {
        if (localStorage.getItem('isCompany') == 'true')
            return true;
        else
            return false;
    };
    ProjectsComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (this.isCompany()) {
            this.authService.getCompany().subscribe(function (profile) {
                _this.account = profile.company;
                _this.authService.getProjectbyComp(_this.account._id).subscribe(function (data) {
                    _this.projects = data.project;
                    _this.authService.getStages(_this.account._id).subscribe(function (profile) {
                        if (profile.stage[0]) {
                            _this.stages = profile.stage[0].stages;
                            _this.stagesClone = profile.stage[0].stages;
                            console.log(_this.stages);
                        }
                    }, function (err) {
                        console.log(err);
                        return false;
                    });
                    console.log(_this.projects);
                    _this.authService.getClients(_this.account._id).subscribe(function (profile) {
                        _this.clients = profile;
                    }, function (err) {
                        console.log(err);
                        return false;
                    });
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
        else {
            this.authService.getProfile().subscribe(function (profile) {
                _this.account = profile.employee;
                _this.authService.getProjectbyComp(_this.account.compId).subscribe(function (data) {
                    _this.projects = data.project;
                    console.log(_this.projects);
                    _this.authService.getStages(_this.account.compId).subscribe(function (profile) {
                        if (profile.stage[0]) {
                            _this.stages = profile.stage[0].stages;
                            _this.stagesClone = profile.stage[0].stages;
                            console.log(_this.stages);
                        }
                        _this.authService.getProjectbyComp(_this.account.compId).subscribe(function (data) {
                            for (var o = 0; o < data.project.length; o++) {
                                for (var u = 0; u < data.project[o].EmpInvolved.length; u++) {
                                    if (data.project[o].EmpInvolved[u] == _this.account.empUsername) {
                                        _this.projects.push(data.project[o]);
                                    }
                                }
                            }
                        }, function (err) {
                        });
                    }, function (err) {
                        console.log(err);
                        return false;
                    });
                    _this.authService.getClients(_this.account.compId).subscribe(function (profile) {
                        _this.clients = profile.client;
                        console.log(_this.clients);
                    }, function (err) {
                        console.log(err);
                        return false;
                    });
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
    };
    ProjectsComponent.prototype.toggleNew = function () {
        console.log(this.togProject);
        this.togProject = !this.togProject;
    };
    ProjectsComponent.prototype.viewProject = function (i) {
        console.log(i);
        this.router.navigate(['/projects', this.projects[i].ref]);
    };
    ProjectsComponent.prototype.removeProject = function () {
        var _this = this;
        console.log(this.projects[this.proj_i]);
        this.authService.removeProject(this.projects[this.proj_i]._id).subscribe(function (data) {
            console.log(data);
            _this.flashMessages.show('Removing project was successful!', { cssClass: 'alert-success', timeout: 3000 });
            _this.closeModal();
            _this.ngOnInit();
            _this.router.navigate(['/projects']);
        }, function (err) {
            console.log(err);
            _this.flashMessages.show('Removing project was not successful!', { cssClass: 'alert-danger', timeout: 3000 });
            return false;
        });
    };
    ProjectsComponent.prototype.onProjectCreate = function (f) {
        var _this = this;
        var ref = 0;
        for (var i = 0; i < this.clients.length; i++) {
            if (this.clients[i]._id == f.value.cli)
                ref = this.clients[i].ref;
        }
        console.log(ref);
        var newProject = {
            ref: ref,
            compId: this.account.compId,
            createdBy: [this.account.empUsername],
            title: f.value.title,
            clientId: f.value.cli,
            SiteAddress: f.value.address,
            Services: { stages: this.stages }
        };
        console.log(newProject);
        this.authService.addProject(newProject).subscribe(function (data) {
            if (data.success) {
                console.log(data);
                _this.flashMessages.show('Your project is now created! ' + data, { cssClass: 'alert-success', timeout: 3000 });
                _this.togProject = false;
                _this.ngOnInit();
            }
            else {
                console.log(data);
                _this.flashMessages.show('Something went wrong, project was not created. Please try again!', { cssClass: 'alert-danger', timeout: 3000 });
                //this.router.navigate(['register']);
            }
        });
    };
    ProjectsComponent.prototype.toggleRemoveModal = function (i) {
        this.proj_i = i;
        if (document.getElementById("RemoveProjModal").style.opacity == "1") {
            document.getElementById("RemoveProjModal").style.opacity = "0";
            document.getElementById("RemoveProjModal").style.display = "none";
        }
        else {
            document.getElementById("RemoveProjModal").style.display = "block";
            document.getElementById("RemoveProjModal").style.opacity = "1";
        }
    };
    ProjectsComponent.prototype.closeModal = function () {
        document.getElementById("RemoveProjModal").style.opacity = "0";
        document.getElementById("RemoveProjModal").style.display = "none";
    };
    ProjectsComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-projects',
            template: __webpack_require__("./src/app/components/projects/projects.component.html"),
            styles: [__webpack_require__("./src/app/components/projects/projects.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]])
    ], ProjectsComponent);
    return ProjectsComponent;
}());



/***/ }),

/***/ "./src/app/components/projects/update-project/update-project.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/projects/update-project/update-project.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n  update-project works!\n</p>\n"

/***/ }),

/***/ "./src/app/components/projects/update-project/update-project.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UpdateProjectComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var UpdateProjectComponent = /** @class */ (function () {
    function UpdateProjectComponent() {
    }
    UpdateProjectComponent.prototype.ngOnInit = function () {
    };
    UpdateProjectComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-update-project',
            template: __webpack_require__("./src/app/components/projects/update-project/update-project.component.html"),
            styles: [__webpack_require__("./src/app/components/projects/update-project/update-project.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], UpdateProjectComponent);
    return UpdateProjectComponent;
}());



/***/ }),

/***/ "./src/app/components/projects/view-project/view-project.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/projects/view-project/view-project.component.html":
/***/ (function(module, exports) {

module.exports = " <!-- Page Heading -->\n <div class=\"row\" *ngIf=\" project\">\n    <div class=\"col-lg-12\">\n      <h1 class=\"page-header\">\n                        Project View: {{project.title}} \n                    </h1>\n      <ol class=\"breadcrumb\">\n        <li >\n          <i class=\"fa fa-dashboard\"></i> Dashboard\n        </li>\n        <li >\n            <i class=\"fa fa-dashboard\"></i> Project Manager\n          </li>\n        <li class=\"active\">\n            <i class=\"fa fa-dashboard\"></i> View Project\n          </li>\n      </ol>\n    </div>\n  </div>\n  <!-- /.row -->\n<div id=\"wrapper\"><h2>Project Progress</h2>\n<div class=\"completion col-sm-12\" ><div id=\"progressBar\"><p class=\"text-al--center light\" *ngIf=\"project\">{{project.projectProgress }}%</p></div></div>\n\n\n<div class=\"col-sm-6 left\">\n    <div class=\"projectItem col-sm-12\" *ngIf=\"project\">\n        <h2>Project Information</h2>\n        <h4>Project Title:<br><small>{{project.title}}</small></h4>\n        <h4>Project Leads:<br><small><span *ngFor=\"let emp of project.createdBy; index as i\">{{emp}},</span> <button class=\"btn btn-primary\" (click)=\"toggleLeadModal()\" *ngIf=\"isUserLead()\"><span class=\"glyphicon glyphicon-plus \"></span></button></small></h4>\n        <h4>Project Site Address:<br><small>{{project.SiteAddress}}</small></h4>\n        <h4 *ngIf=\"isUserLead()\">Project Budget:<br><small>€{{calcTotalBudget()}}</small></h4>\n        <h4>Employees Involved:<br><small ><span *ngFor=\"let emp of project.EmpInvolved; index as j\">{{emp}},</span> <button class=\"btn btn-primary\" (click)=\"toggleEmployeeModal()\" *ngIf=\"isUserLead()\"><span class=\"glyphicon glyphicon-plus \"></span></button></small></h4>\n      </div>\n</div>\n<div class=\"col-sm-6 right\">\n    <div class=\"projectItem col-sm-12\" *ngIf=\"client\">\n        <h2>Client Information</h2>\n        <h4>Client Name:<br><small>{{client.Name}}</small></h4>\n        <h4>Client Address:<br><small>{{client.Address}}</small></h4>\n        <h4>Client Email:<br><small>{{client.Email}}</small></h4>\n        <h4>Client Mobile:<br><small>{{client.MobileTel}}</small></h4>\n        <h4>Client Office:<br><small>{{client.OfficeTel}}</small></h4>\n    </div>\n</div>\n<hr style=\"width:100%; color:#72002f; background:#72002f;\">\n<div class=\"col-sm-12\" *ngIf=\"project \">\n  <h2>Project Services Included</h2>\n    <ngb-tabset *ngIf=\"project && account\">\n        <ngb-tab *ngFor=\"let g of project.Services.stages; index as h\" title=\"Stage {{h+1}}\" class=\"active\">\n          <ng-template ngbTabContent *ngIf=\"project && account\">\n            <h4 class=\"text-al--left col-sm-6\"><i class=\"glyphicon glyphicon-tag\" [ngStyle]=\"{\n              color: budgetIndicator(h)}\" style=\" text-shadow: 2px 2px 5px #bbb;\" *ngIf=\"isUserLead()\" matTooltip=\"{{getStageBudget(h)}}\"> </i> {{g.stage_title}} <span class=\"label label-success\" *ngIf=\"g.completed\"> COMPLETED</span>\n              <button class=\"btn btn-primary serviceBtn\" (click)=\"index_h = h; toggleNewTimesheetModal()\" matTooltip=\"Add Timesheets\"><span class=\"glyphicon glyphicon-time\"></span>\n                  \n              </button>\n              <button class=\"btn btn-action serviceBtn\" (click)=\"index_h = h; toggleBudgetModal(h)\" matTooltip=\"Edit Stage Budget\" *ngIf=\"isUserLead()\"><span class=\"glyphicon glyphicon-edit\"></span>\n                \n              </button></h4>\n              \n              <div class=\"genBtn\">\n                \n                <!-- <button (click)=\"index_h = h; genEstimate()\" class=\"btn btn-primary dd-button\">\n                    Estimate\n                </button>\n                <button (click)=\"index_h = h; genInvoice()\" class=\"btn btn-primary dd-button \"  [disabled]=\"!g.completed\">\n                   Invoice\n                </button> -->\n           </div>\n            <div class=\"table-responsive col-sm-12\">          \n                <table class=\"table table-striped\" *ngIf=\"project && account\">\n                  <thead>\n                    <tr>\n                      \n                      <th class=\"col-sm-1\">Complete</th>\n                      <th class=\"col-sm-4\">Title</th>\n                      <th class=\"col-sm-1\">Fee</th>\n                      <th class=\"col-sm-2\">Notes</th>\n                      <th class=\"col-sm-4\">Actions</th>\n                    </tr>\n                  </thead>\n                  <tbody *ngIf=\"project && account\">\n                    <tr *ngFor=\"let pro of g.services ; let i = index\" [hidden]=\"!pro.isActive\">\n                      <td class=\"text-al--left col-sm-1\"><input type=\"checkbox\" name=\"pro.complete\" [(ngModel)]=\"pro.complete\" (change)=\"onServicesChange()\" value=\"\"></td>\n                      <td class=\"text-al--left col-sm-6\"><p>{{pro.title}}</p></td>\n                      <td class=\"text-al--left col-sm-1\"><p>€ {{pro.fee}}</p></td>\n                      <td class=\"text-al--left col-sm-2\"><p>{{pro.notes}}</p></td>\n                      <td class=\"text-al--left col-sm-2\">\n                          <button class=\"btn btn-primary  serviceBtn\" (click)=\"toggleNoteBtn(h,i)\" matTooltip=\"Edit Service Notes\"> <i class=\"glyphicon glyphicon-comment\"></i></button><button class=\"btn btn-action serviceBtn\" (click)=\"toggleFeeBtn(h,i)\" matTooltip=\"Edit Service Fees\"><i class=\"glyphicon glyphicon-euro\"></i></button>\n                      </td>\n                    </tr>\n                  </tbody>\n                </table>\n                </div>\n            \n          </ng-template>\n        </ngb-tab>\n      </ngb-tabset>\n         </div>\n\n         <button class=\"btn btn-primary\" (click)=\"updateProgress()\" [disabled]=\"!updateflag\">UPDATE</button>\n\n<!-- <div class=\"col-sm-6 right\" *ngIf=\"project.Services\">\n    <h2>Project Services Included</h2>\n    <div class=\"col-sm-12 projectItem\" *ngFor=\"let g of project.Services.stages; index as h\">\n            \n        <ul class=\"servicegroups col-sm-12\">\n            <h4> <!--<span [ngClass]=\"{\n              'budget_fail': g.budget <= 'Error', \n              'budget_warning': g.budget === 'Warning', \n              'budget_ok': g.budget === 'Ignored'}\"></span> {{g.stage_title}}</h4> \n            <li *ngFor=\"let info of g.services index as i\" [hidden]=\"!info.isActive\">\n                <div class=\"col-sm-9\"><p > <input type=\"checkbox\" name=\"info.complete\" [(ngModel)]=\"info.complete\" (change)=\"onServicesChange()\" value=\"\">{{ info.title }} </p></div>\n                <div class=\"col-sm-3\"><button class=\"btn btn-primary rounded  serviceBtn\" (click)=\"toggleNoteBtn(h,i)\"> <span class=\"glyphicon glyphicon-comment\"></span></button><button class=\"btn btn-primary rounded serviceBtn\" (click)=\"toggleFeeBtn(h,i)\"><span class=\"glyphicon glyphicon-euro\"></span></button></div>\n            </li>\n            \n          </ul>\n          </div>\n          <button class=\"btn btn-primary\" (click)=\"updateProgress()\" [disabled]=\"!updateflag\">UPDATE</button>\n</div> -->\n\n<div id=\"ModalBoxFee\" class=\"FormModal\" *ngIf=\"project && account\">\n    <h1>Update Service Fee<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n  </i></h1>\n    <form #g=\"ngForm\" (ngSubmit)=\"updateFee(g)\">\n      \n       <p class=\"bold\" *ngIf=\"project\">{{dialog_title}}</p>\n\n        <label for=\"InputDay1\" class=\"col-sm-2\">Service Fee:\n          <p>€</p><input type=\"Number\" class=\"form-control\" id=\"InputFee\" name=\"upFee\" required [(ngModel)]=\"upFee\">\n        </label>\n      <input type=\"submit\" value=\"Update Service Fee\" />\n    </form>\n    </div>\n    <div id=\"ModalBoxNote\" class=\"FormModal\" *ngIf=\"project && account\">\n        <h1>Update Service Notes<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n      </i></h1>\n        <form #f=\"ngForm\" (ngSubmit)=\"updateNote(f)\">\n          \n           <h4 class=\"bold\" *ngIf=\"project\">{{dialog_title}}</h4>\n    \n         <h4>Service Note:</h4>\n                <textarea rows=\"4\" class=\"form-control\" id=\"Inputnote\"  name=\"upNote\"  required [(ngModel)]=\"upNote\"></textarea>\n            \n          <input type=\"submit\" value=\"Update Service Fee\" />\n        </form>\n        </div>\n    <!--  --></div>\n    <div id=\"addEmployeeForm\" class=\"FormModal\" *ngIf=\"project && account\">\n        <h1>Add Employee to Project<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n          </i></h1>\n        <form #k=\"ngForm\" (ngSubmit)=\"addEmpToProj(k)\">\n            <div class=\"col-sm-12\">\n              <p >Who would you like to add to this project.\n               \n               </p>\n             </div>\n             <div class=\"form-group\">\n               <label for=\"inputName\">Employee:</label>\n               <select class=\"form-control\" name=\"employee\" #employee=\"ngModel\" ngModel  >\n                 <option value=\"{{f.empUsername}}\" *ngFor=\"let f of employees; index as h\">{{f.empName}}</option>\n                 \n                   <button class=\"btn btn-primary\"(click)=\"addEmpToProj(h)\"><i class=\"glyphicon glyphicon-plus\"></i></button>\n               </select>\n               <ul>\n                 <li *ngFor=\"let d of empList\">{{d}}</li>\n               </ul>\n              \n             </div>\n             \n          \n         \n         \n         \n            \n             <input type=\"submit\" value=\"Add employee to project\" />\n           </form>\n      </div>\n\n\n      <div id=\"addLeadForm\" class=\"FormModal\" *ngIf=\"project && account\">\n        <h1>Add Employee to Lead Project<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n          </i></h1>\n        <form #q=\"ngForm\" (ngSubmit)=\"addProjLead(q)\">\n            <div class=\"col-sm-12\"><p >Who would you like to add to this project. </p>  </div>\n             <div class=\"form-group\">\n               <label for=\"inputName\">Employee:</label>\n               <select class=\"form-control\" name=\"employee\" #employee=\"ngModel\" ngModel  >\n                 <option value=\"{{f.empUsername}}\" *ngFor=\"let f of employees; index as h\">{{f.empName}}</option>\n                   <button class=\"btn btn-primary\"(click)=\"addEmpToProj(h)\"><i class=\"glyphicon glyphicon-plus\"></i></button>\n               </select>\n               <ul>\n                 <li *ngFor=\"let d of empList\">{{d}}</li>\n               </ul>\n              \n             </div>\n          \n             <input type=\"submit\" value=\"Add employee to project\" />\n           </form>\n      </div>\n      <div id=\"BudgetModal\" class=\"FormModal\" *ngIf=\"project && account\">\n        <h1>Update Stage Budget<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n      </i></h1>\n      \n        <form #l=\"ngForm\" (ngSubmit)=\"onBudgetSubmit(l)\">\n         \n          <div class=\"form-group col-sm-12\"><h4>Set Budget</h4>  \n            <input type=\"number\" class=\"form-control\" id=\"inputBudget\" placeholder=\"Enter Stage Budget\" name=\"upBudget\" [(ngModel)]=\"upBudget\" required >\n        </div>   \n          <input type=\"submit\" value=\"Add Timesheet\"/>\n        </form>\n        </div>\n\n\n\n    <table id=\"basic-table\" style=\"display: none;\" *ngIf=\"project && account\">\n        <h4>{{project.Services.stages[index_h].stage_title}}</h4>\n        <thead>\n          <tr >\n            \n            <th>Service Name</th>\n            <th>Fee</th>\n            <th>Notes</th>\n            \n          </tr>\n        </thead>\n        <tbody>\n          <tr *ngFor=\"let g of project.Services.stages[index_h].services; index as h\" [hidden]=\"!g.isActive\">\n\n            <td>{{g.title}}</td>\n            <td>€{{g.fee}}</td>\n            <td>{{g.notes}}</td>\n\n          </tr>\n\n        </tbody>\n      </table>"

/***/ }),

/***/ "./src/app/components/projects/view-project/view-project.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ViewProjectComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};








var now = new Date();
var ViewProjectComponent = /** @class */ (function () {
    function ViewProjectComponent(window, validateService, flashMessages, authService, router, route, modalService, zone, // <== added
    dialog) {
        this.window = window;
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.route = route;
        this.modalService = modalService;
        this.zone = zone;
        this.dialog = dialog;
        this.date = new __WEBPACK_IMPORTED_MODULE_6__angular_forms__["b" /* FormControl */](new Date());
        this.serializedDate = new __WEBPACK_IMPORTED_MODULE_6__angular_forms__["b" /* FormControl */]((new Date()).toISOString());
        this.dialog_title = '';
        this.index_h = 0;
        this.upBudget = 0.00;
        this.ts_budget = [];
        this.stage_i = 0;
        this.service_i = 0;
        this.upFee = 0.00;
        this.upNote = 'No Notes Yet';
        this.todayDate = true;
        this.updateflag = false;
    }
    ViewProjectComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (localStorage.getItem('isCompany') == 'true') {
            this.authService.getCompany().subscribe(function (data) {
                _this.account = data.company;
                _this.authService.getProjectbyId(_this.route.snapshot.params['id']).subscribe(function (profile) {
                    _this.project = profile.project[0];
                    for (var i = 0; i < _this.account.employees.length; i++) {
                        if (_this.account.employees[i].empUsername == _this.project.createdBy) {
                            _this.selEmployee = _this.account.employees[i];
                            //   console.log(this.selEmployee);
                        }
                    }
                    _this.employees = _this.account.employees;
                    // console.log(this.project);
                    _this.project.projectProgress = _this.project.projectProgress.toFixed(2);
                    //GETTING CLIENT INFORMATION
                    document.getElementById('progressBar').style.width = _this.project.projectProgress + '%';
                    _this.authService.getClientbyId(_this.project.clientId).subscribe(function (client) {
                        _this.client = client.client;
                        //   console.log(this.client);
                        for (var i = 0; i < _this.employees.length; i++) {
                            if (_this.selEmployee.empUsername === _this.employees[i].empUsername) {
                                _this.employees.splice(i, 1);
                            }
                            //  console.log(this.project);
                        }
                        _this.authService.getBudgetTimesheets(_this.project._id).subscribe(function (data) {
                            _this.ts = data.timesheet;
                            if (_this.timesheets !== null || _this.timesheets !== undefined) {
                                for (var i = 0; i < _this.project.Services.stages.length; i++) {
                                    var tsi = 0;
                                    for (var j = 0; j < _this.ts.length; j++) {
                                        //looping through the array of timesheet hours
                                        for (var k = 0; k < _this.ts[j].hourly_ts.length; k++) {
                                            if (_this.project.Services.stages[i]._id === _this.ts[j].hourly_ts[k].stage.stId) {
                                                tsi += 15;
                                            }
                                        }
                                    }
                                    tsi = (tsi / 60) * parseFloat(_this.account.empHrRate);
                                    //   console.log(tsi)
                                    _this.ts_budget.push(tsi);
                                }
                            }
                            //  console.log(this.ts_budget);
                        }, function (err) {
                            //   console.log(err);
                            return false;
                        });
                    }, function (err) {
                        //    console.log(err);
                        return false;
                    });
                    //   console.log(this.employees);
                }, function (err) {
                });
            }, function (err) {
            });
        }
        else {
            this.authService.getProfile().subscribe(function (data) {
                _this.account = data.employee;
                _this.authService.getCompanybyEmpId(_this.account.compId).subscribe(function (data) {
                    _this.employees = data.company;
                    _this.authService.getProjectbyId(_this.route.snapshot.params['id']).subscribe(function (profile) {
                        _this.project = profile.project[0];
                        //   console.log(this.project);
                        _this.project.projectProgress = _this.project.projectProgress.toFixed(2);
                        //GETTING CLIENT INFORMATION
                        document.getElementById('progressBar').style.width = _this.project.projectProgress + '%';
                        _this.authService.getClientbyId(_this.project.clientId).subscribe(function (client) {
                            _this.client = client.client;
                            //    console.log(this.client);
                            for (var i = 0; i < _this.employees.length; i++) {
                                if (_this.account.empUsername === _this.employees[i].empUsername) {
                                    _this.employees.splice(i, 1);
                                }
                                //      console.log(this.project);
                            }
                            _this.authService.getBudgetTimesheets(_this.project._id).subscribe(function (data) {
                                _this.ts = data.timesheet;
                                if (_this.timesheets !== null || _this.timesheets !== undefined) {
                                    for (var i = 0; i < _this.project.Services.stages.length; i++) {
                                        var tsi = 0;
                                        for (var j = 0; j < _this.ts.length; j++) {
                                            //looping through the array of timesheet hours
                                            for (var k = 0; k < _this.ts[j].hourly_ts.length; k++) {
                                                if (_this.project.Services.stages[i]._id === _this.ts[j].hourly_ts[k].stage.stId) {
                                                    tsi += 15;
                                                }
                                            }
                                        }
                                        tsi = (tsi / 60) * parseFloat(_this.account.empHrRate);
                                        //      console.log(tsi)
                                        _this.ts_budget.push(tsi);
                                    }
                                }
                                //    console.log(this.ts_budget);
                            }, function (err) {
                                //      console.log(err);
                                return false;
                            });
                        }, function (err) {
                            //     console.log(err);
                            return false;
                        });
                        //    console.log(this.employees);
                    }, function (err) {
                    });
                }, function (err) {
                    //    console.log(err);
                    _this.router.navigate(['/projects']);
                    return false;
                });
            }, function (err) {
                //    console.log(err);
                return false;
            });
            // if(this.route.snapshot.params['id']!=undefined){
            //}
            // else{
            //   this.router.navigate(['/projects']);
            // }
        }
    };
    ViewProjectComponent.prototype.isUserLead = function () {
        var flag = false;
        for (var i = 0; i <= this.project.createdBy.length; i++) {
            if (this.account.empUsername === this.project.createdBy[i]) {
                flag = true;
            }
        }
        if (flag)
            return true;
        else
            return false;
    };
    ViewProjectComponent.prototype.calcTotalBudget = function () {
        var totBudget = 0;
        for (var i = 0; i < this.project.Services.stages.length; i++) {
            totBudget += this.project.Services.stages[i].budget;
        }
        return totBudget;
    };
    ViewProjectComponent.prototype.checkStageComplete = function () {
    };
    ViewProjectComponent.prototype.updateProgress = function () {
        var _this = this;
        //   console.log(this.project.Services);
        var totServices = 0, completeServices = 0, projectCompletion = 0;
        for (var i = 1; i < this.project.Services.stages.length; i++) {
            for (var k = 0; k < this.project.Services.stages[i].services.length; k++) {
                if (this.project.Services.stages[i].services[k].isActive) {
                    totServices++;
                }
                if (this.project.Services.stages[i].services[k].complete) {
                    completeServices++;
                }
            }
        }
        this.checkStageComplete();
        projectCompletion = (completeServices / totServices) * 100;
        //  console.log(projectCompletion+"% is the current completion percentage");
        this.project.projectProgress = projectCompletion;
        //  console.log(this.project.projectProgress+"% is the current completion percentage");
        this.authService.updateProject(this.project).subscribe(function (data) {
            _this.project = data.project;
            _this.flashMessages.show('Update was successful!', { cssClass: 'alert-success', timeout: 3000 });
            _this.ngOnInit();
        }, function (err) {
            //    console.log(err);
            _this.flashMessages.show('Update was not successful!', { cssClass: 'alert-danger', timeout: 3000 });
            return false;
        });
    };
    ViewProjectComponent.prototype.selectToday = function () {
        this.model = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
        };
    };
    ViewProjectComponent.prototype.setDate = function (d, m, y) {
        this.model = {
            year: d,
            month: m + 1,
            day: y,
        };
    };
    ViewProjectComponent.prototype.getStageBudget = function (i) {
        console.log("€" + this.ts_budget[i].toFixed(2) + " / €" + this.project.Services.stages[i].budget.toFixed(2));
        return "€" + this.ts_budget[i].toFixed(2) + " / €" + this.project.Services.stages[i].budget.toFixed(2);
    };
    ViewProjectComponent.prototype.onServicesChange = function () {
        //   console.log('fff');
        var projCompletion = 0;
        for (var i = 0; i < this.project.Services.stages.length; i++) {
            var totServices = 0, completeServices = 0, projectCompletion = 0;
            for (var k = 0; k < this.project.Services.stages[i].services.length; k++) {
                if (this.project.Services.stages[i].services[k].isActive) {
                    totServices++;
                }
                if (this.project.Services.stages[i].services[k].complete) {
                    completeServices++;
                }
            }
            if (this.project.Services.stages[i].completed) {
                projCompletion++;
            }
            if (totServices === completeServices)
                this.project.Services.stages[i].completed = true;
            else {
                this.project.Services.stages[i].completed = false;
            }
        }
        if (this.project.projectProgress == 100.00) {
            this.project.projectComplete = true;
            this.project.projectCompletionDate = new Date();
        }
        else {
            this.project.projectComplete = false;
            this.project.projectCompletionDate = null;
        }
        // console.log(this.project);
        this.updateflag = true;
    };
    ViewProjectComponent.prototype.addEmpToProj = function (j) {
        var f = false;
        for (var i = 0; i < this.project.EmpInvolved.length; i++) {
            if (j.value.employee == this.project.EmpInvolved[i]) {
                f = true;
            }
        }
        if (!f)
            this.project.EmpInvolved.push(j.value.employee);
        else {
            this.flashMessages.show('employee already in list', { cssClass: 'alert-danger', timeout: 3000 });
        }
        //  console.log(this.project);
        this.updateflag = true;
    };
    ViewProjectComponent.prototype.addProjLead = function (j) {
        var f = false;
        for (var i = 0; i < this.project.createdBy.length; i++) {
            if (j.value.employee == this.project.createdBy[i]) {
                f = true;
            }
        }
        if (!f)
            this.project.createdBy.push(j.value.employee);
        else {
            this.flashMessages.show('employee already in list', { cssClass: 'alert-danger', timeout: 3000 });
        }
        //  console.log(this.project);
        this.updateflag = true;
    };
    ViewProjectComponent.prototype.budgetIndicator = function (i) {
        var budget_perc = (this.ts_budget[i] / this.project.Services.stages[i].budget) * 100;
        // console.log(budget_perc);
        if (budget_perc > 95) {
            return 'red';
        }
        else if (budget_perc > 80) {
            return 'yellow';
        }
        else {
            return 'green';
        }
    };
    ViewProjectComponent.prototype.updateFee = function (f) {
        this.project.Services.stages[this.stage_i].services[this.service_i].fee = f.value.upFee;
        //console.log(this.project.Services.stages[this.stage_i].services[this.service_i].fee);
        this.updateflag = true;
        this.closeModal();
    };
    ViewProjectComponent.prototype.updateNote = function (f) {
        this.project.Services.stages[this.stage_i].services[this.service_i].notes = f.value.upNote;
        console.log(this.project.Services.stages[this.stage_i].services[this.service_i].notes);
        this.updateflag = true;
        this.closeModal();
    };
    ViewProjectComponent.prototype.toggleFeeBtn = function (stage_i, service_i) {
        this.stage_i = stage_i;
        this.service_i = service_i;
        this.dialog_title = this.getTitleforService();
        if (document.getElementById("ModalBoxFee").style.opacity == "1") {
            document.getElementById("ModalBoxFee").style.opacity = "0";
            document.getElementById("ModalBoxFee").style.display = "none";
        }
        else {
            this.upFee = this.project.Services.stages[this.stage_i].services[this.service_i].fee;
            //  console.log(this.upFee);
            //  console.log("-----------------------------");
            //  console.log(this.project.Services.stages[this.stage_i].services[this.service_i].fee);
            document.getElementById("ModalBoxFee").style.display = "block";
            document.getElementById("ModalBoxFee").style.opacity = "1";
        }
    };
    ViewProjectComponent.prototype.getTitleforService = function () {
        return this.project.Services.stages[this.stage_i].services[this.service_i].title;
    };
    ViewProjectComponent.prototype.toggleNoteBtn = function (stage_i, service_i) {
        this.stage_i = stage_i;
        this.service_i = service_i;
        this.dialog_title = this.getTitleforService();
        if (document.getElementById("ModalBoxNote").style.opacity == "1") {
            document.getElementById("ModalBoxNote").style.opacity = "0";
            document.getElementById("ModalBoxNote").style.display = "none";
        }
        else {
            this.upNote = this.project.Services.stages[this.stage_i].services[this.service_i].notes;
            document.getElementById("ModalBoxNote").style.display = "block";
            document.getElementById("ModalBoxNote").style.opacity = "1";
        }
    };
    ViewProjectComponent.prototype.closeModal = function () {
        document.getElementById("ModalBoxFee").style.opacity = "0";
        document.getElementById("ModalBoxFee").style.display = "none";
        document.getElementById("ModalBoxNote").style.opacity = "0";
        document.getElementById("ModalBoxNote").style.display = "none";
        document.getElementById("addEmployeeForm").style.opacity = "0";
        document.getElementById("addEmployeeForm").style.display = "none";
        document.getElementById("BudgetModal").style.opacity = "0";
        document.getElementById("BudgetModal").style.display = "none";
        document.getElementById("addLeadForm").style.opacity = "0";
        document.getElementById("addLeadForm").style.display = "none";
    };
    ViewProjectComponent.prototype.genInvoice = function () {
        setTimeout(3000);
        var p = this.client;
        var doc = new jsPDF('p', 'pt');
        var res = doc.autoTableHtmlToJson(document.getElementById("basic-table"));
        var pos = 50;
        var header = function (data) {
            doc.setFontSize(28);
            doc.setTextColor(40);
            doc.setFontStyle('normal');
            //      doc.addImage('../../../../assets/images/logo_smalll_white.png', 'png', data.settings.margin.left, 20, 50, 50);
            doc.text("Client Invoice", data.settings.margin.left, pos);
            doc.setFontSize(10);
            doc.text("Date: " + new Date().toString(), data.settings.margin.left, pos + 15);
            doc.setFontSize(14);
            doc.text("Downey Planning And Architecture", data.settings.margin.left, pos + 30);
            doc.text("1 Westland Square,", data.settings.margin.left, pos + 45);
            doc.text("Pearse Street,", data.settings.margin.left, pos + 60);
            doc.text("Co. Dublin.", data.settings.margin.left, pos + 75);
            doc.setFontSize(20);
            doc.text("BILLING TO", data.settings.margin.left, pos + 115);
            doc.setFontSize(14);
            doc.text(p.Name, data.settings.margin.left, pos + 130);
            var gg = p.Address;
            var ss = gg.split(',');
            var dr = 20;
            for (var i = 0; i < ss.length; i++) {
                doc.text(ss[i] + ',', data.settings.margin.left, pos + 130 + dr);
                dr += 20;
            }
        };
        var options = {
            beforePageContent: header,
            margin: {
                top: 250
            },
            startY: doc.autoTableEndPosY() + 260
        };
        var td = new Date();
        var dd = td.getDate();
        var mm = td.getMonth();
        var yy = td.getFullYear();
        doc.autoTable(res.columns, res.data, options);
        doc.text("Client Signature", 40, doc.autoTableEndPosY() + 40);
        doc.text("____________________________", 40, doc.autoTableEndPosY() + 60);
        doc.save("invoice_" + dd + "_" + (mm + 1) + "_" + yy + ".pdf", function (err, callback) {
            if (err)
                throw err;
            console.log(callback);
        });
    };
    ViewProjectComponent.prototype.genEstimate = function () {
        setTimeout(3000);
        var p = this.client;
        var doc = new jsPDF('p', 'pt');
        var res = doc.autoTableHtmlToJson(document.getElementById("basic-table"));
        var pos = 50;
        var header = function (data) {
            doc.setFontSize(28);
            doc.setTextColor(40);
            doc.setFontStyle('normal');
            //      doc.addImage('../../../../assets/images/logo_smalll_white.png', 'png', data.settings.margin.left, 20, 50, 50);
            doc.text("Client Estimate", data.settings.margin.left, pos);
            doc.setFontSize(10);
            doc.text("Date: " + new Date().toString(), data.settings.margin.left, pos + 15);
            doc.setFontSize(14);
            doc.text("Downey Planning And Architecture", data.settings.margin.left, pos + 30);
            doc.text("1 Westland Square,", data.settings.margin.left, pos + 45);
            doc.text("Pearse Street,", data.settings.margin.left, pos + 60);
            doc.text("Co. Dublin.", data.settings.margin.left, pos + 75);
            doc.setFontSize(20);
            doc.text("BILLING TO", data.settings.margin.left, pos + 115);
            doc.setFontSize(14);
            doc.text(p.Name, data.settings.margin.left, pos + 130);
            var gg = p.Address;
            var ss = gg.split(',');
            var dr = 20;
            for (var i = 0; i < ss.length; i++) {
                doc.text(ss[i] + ',', data.settings.margin.left, pos + 130 + dr);
                dr += 20;
            }
        };
        var options = {
            beforePageContent: header,
            margin: {
                top: 250
            },
            startY: doc.autoTableEndPosY() + 260
        };
        var td = new Date();
        var dd = td.getDate();
        var mm = td.getMonth();
        var yy = td.getFullYear();
        doc.autoTable(res.columns, res.data, options);
        doc.text("Client Signature", 40, doc.autoTableEndPosY() + 40);
        doc.text("____________________________", 40, doc.autoTableEndPosY() + 60);
        doc.save("estimate_" + dd + "_" + (mm + 1) + "_" + yy + ".pdf", function (err, callback) {
            if (err)
                throw err;
            console.log(callback);
        });
    };
    ViewProjectComponent.prototype.toggleBudgetModal = function (stage_i) {
        this.stage_i = stage_i;
        if (document.getElementById("BudgetModal").style.opacity == "1") {
            document.getElementById("BudgetModal").style.opacity = "0";
            document.getElementById("BudgetModal").style.display = "none";
        }
        else {
            this.upBudget = this.project.Services.stages[this.stage_i].budget;
            document.getElementById("BudgetModal").style.display = "block";
            document.getElementById("BudgetModal").style.opacity = "1";
        }
    };
    ViewProjectComponent.prototype.toggleEmployeeModal = function () {
        if (document.getElementById("addEmployeeForm").style.opacity == "1") {
            document.getElementById("addEmployeeForm").style.opacity = "0";
            document.getElementById("addEmployeeForm").style.display = "none";
        }
        else {
            document.getElementById("addEmployeeForm").style.display = "block";
            document.getElementById("addEmployeeForm").style.opacity = "1";
        }
    };
    ViewProjectComponent.prototype.toggleLeadModal = function () {
        if (document.getElementById("addLeadForm").style.opacity == "1") {
            document.getElementById("addLeadForm").style.opacity = "0";
            document.getElementById("addLeadForm").style.display = "none";
        }
        else {
            document.getElementById("addLeadForm").style.display = "block";
            document.getElementById("addLeadForm").style.opacity = "1";
        }
    };
    ViewProjectComponent.prototype.toggleNewTimesheetModal = function () {
        this.router.navigate(['timesheets']);
    };
    ViewProjectComponent.prototype.onBudgetSubmit = function (l) {
        this.project.Services.stages[this.stage_i].budget = this.upBudget;
        this.updateflag = true;
        this.closeModal();
        // this.authService.updateProject(this.project).subscribe(data=>{
        //   if(data.success){
        //       console.log(data);
        //       this.flashMessages.show('You have added a new timesheet ',{cssClass: 'alert-success',timeout:3000});
        //       this.ngOnInit();
        //   }
        //   else {
        //     console.log(data);
        //     this.flashMessages.show(data,{cssClass: 'alert-danger',timeout:3000});
        //   }
        // });
        // console.log(l.value);
    };
    ViewProjectComponent.prototype.onTimesheetSubmit = function (l) {
        var _this = this;
        var emp;
        this.authService.getProfile().subscribe(function (data) {
            emp = data.employee;
            //    console.log(emp);
            var d;
            if (l.value.todayDate) {
                d = new Date();
            }
            else {
                d = new Date(l.value.date.year, l.value.date.month - 1, l.value.date.day);
            }
            //  console.log(d);
            var ts = {
                empUsername: emp.empUsername,
                projectId: _this.project._id,
                clientId: _this.client._id,
                stageId: _this.project.Services.stages[_this.index_h]._id,
                date: d,
                timeSpent: l.value.time,
                note: l.value.note,
            };
            //   console.log(ts);
            _this.authService.registerTimesheets(ts).subscribe(function (data) {
                if (data.success) {
                    //         console.log(data);
                    _this.flashMessages.show('You have added a new timesheet ', { cssClass: 'alert-success', timeout: 3000 });
                    _this.ngOnInit();
                }
                else {
                    //      console.log(data);
                    _this.flashMessages.show(data, { cssClass: 'alert-danger', timeout: 3000 });
                }
            });
        }, function (err) {
            //     console.log(err);
            return false;
        });
        //   console.log(l.value);
    };
    ViewProjectComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-view-project',
            template: __webpack_require__("./src/app/components/projects/view-project/view-project.component.html"),
            styles: [__webpack_require__("./src/app/components/projects/view-project/view-project.component.css")],
            providers: [
                { provide: 'Window', useValue: window }
            ]
        }),
        __param(0, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Inject"])('Window')),
        __metadata("design:paramtypes", [Window,
            __WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["a" /* ActivatedRoute */],
            __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */],
            __WEBPACK_IMPORTED_MODULE_0__angular_core__["NgZone"],
            __WEBPACK_IMPORTED_MODULE_7__angular_material__["i" /* MatDialog */]])
    ], ViewProjectComponent);
    return ViewProjectComponent;
}());



/***/ }),

/***/ "./src/app/components/register/register.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/register/register.component.html":
/***/ (function(module, exports) {

module.exports = "<form #f=\"ngForm\" (ngSubmit)=\"onCompanySubmit(f)\">\n\n    <h1 class=\"center\">Register Company</h1>\n    <div class=\"col-sm-6 left\">\n    \n    <div class=\"form-group\">\n      <label for=\"inputName\">Company UserName</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputName\" name=\"compname\" ngModel required #compname=\"ngModel\" [ngStyle]=\"myStyle1\" (change)=\"myStyle1={border:checkInput(compname.value)}\">\n    </div>\n    <div class=\"form-group\">\n      <label for=\"inputTitle\">Company Title</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputTitle\" name=\"comptitle\" ngModel required #comptitle=\"ngModel\" [ngStyle]=\"myStyle2\" (change)=\"myStyle2={border:checkInput(comptitle.value)}\">\n    </div>\n    <div class=\"form-group\">\n      <label for=\"inputEmail\">Email address</label>\n      <input type=\"email\" class=\"form-control\" id=\"inputEmail\" aria-describedby=\"emailHelp\" [ngStyle]=\"myStyle3\" (change)=\"myStyle3={border:checkEmail(email.value)}\" name=\"email\" ngModel required #email=\"ngModel\">\n      <small id=\"emailHelp\" class=\"form-text text-muted\">We'll never share your email with anyone else.</small>\n    </div> \n    <div class=\"form-group\">\n        <label for=\"InputPassword\">Password</label>\n        <input type=\"password\" class=\"form-control\" name=\"password\" ngModel [ngStyle]=\"myStyle4\" (change)=\"myStyle4={border:checkPass(password.value)}\" required #password=\"ngModel\" id=\"InputPassword\" placeholder=\"Enter Password\">\n        <small id=\"emailHelp\" class=\"form-text text-muted\">Password requires two of the following: Uppercase Letter, Lowercase Letters & Numbers with at least 8 characters.</small>\n      </div>\n    <div class=\"form-group\">\n      <label for=\"inputWebsite\">Website:</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputWebsite\" name=\"website\" ngModel required #website=\"ngModel\" [ngStyle]=\"myStyle5\" (change)=\"myStyle5={border:checkInput(website.value)}\">\n    </div>\n    <div class=\"form-group\">\n      <label for=\"inputReg\">Registration Number:</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"companyRegNum\" ngModel required #companyRegNum=\"ngModel\" [ngStyle]=\"myStyle5\" (change)=\"myStyle5={border:checkInput(companyRegNum.value)}\">\n    </div>\n    </div>\n     <div class=\"col-sm-6 right\">\n       <div class=\"form-group\">\n      <label for=\"inputPhone\">Phone Number</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputPhone\"  name=\"phone\" ngModel required #phone=\"ngModel\" [ngStyle]=\"myStyle6\" (change)=\"myStyle6={border:checkInput(phone.value)}\">\n    </div>\n        <div class=\"form-group\">\n      <label for=\"inputAddress\">Address Line 1</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputAddress\" name=\"street\" ngModel required #street=\"ngModel\" [ngStyle]=\"myStyle7\" (change)=\"myStyle7={border:checkInput(street.value)}\">\n    </div>\n     <div class=\"form-group\">\n      <label for=\"inputTown\">Town</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputTown\"  name=\"town\" ngModel required #town=\"ngModel\" [ngStyle]=\"myStyle8\" (change)=\"myStyle8={border:checkInput(town.value)}\">\n    </div>\n     <div class=\"form-group\">\n      <label for=\"inputCounty\">County</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputCounty\" name=\"county\" ngModel required #county=\"ngModel\" [ngStyle]=\"myStyle9\" (change)=\"myStyle9={border:checkInput(county.value)}\">\n    </div>\n     <div class=\"form-group\">\n      <label for=\"inputCountry\">Country</label>\n      <input type=\"text\" class=\"form-control\" id=\"inputCountry\" name=\"country\" ngModel required #country=\"ngModel\" [ngStyle]=\"myStyle10\" (change)=\"myStyle10={border:checkInput(country.value)}\">\n    </div>\n  \n    <br>\n<hr><br>\n  </div>\n  \n   <input type=\"submit\" class=\" col-sm-12 btn btn-default\" value=\"Register\">\n   <br>\n</form>"

/***/ }),

/***/ "./src/app/components/register/register.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RegisterComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var RegisterComponent = /** @class */ (function () {
    function RegisterComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
    }
    RegisterComponent.prototype.ngOnInit = function () {
    };
    RegisterComponent.prototype.onCompanySubmit = function (f) {
        var _this = this;
        console.log(f.value);
        var company = {
            name: f.value.compname,
            title: f.value.comptitle,
            street: f.value.street,
            town: f.value.town,
            county: f.value.county,
            country: f.value.country,
            website: f.value.website,
            email: f.value.email,
            companyRegNum: f.value.companyRegNum,
            phone: f.value.phone,
            password: f.value.password,
        };
        console.log(company);
        if (!this.validateService.ValidateCompRegister(company)) {
            console.log('Please fill in all fields');
            this.flashMessages.show('Please fill in all the fields', { cssClass: 'alert-danger', timeout: 3000 });
        }
        if (!this.validateService.ValidateEmail(company.email)) {
            console.log('Please use a valid email address');
            this.flashMessages.show('Please use a valid email address', { cssClass: 'alert-danger', timeout: 3000 });
        }
        if (!this.validateService.ValidatePassword(company.password)) {
            console.log('Please use a valid Password');
            this.flashMessages.show('Please use a valid Password - Mixed use of UPPER CASE, LOWER CASE & NUMBERS', { cssClass: 'alert-danger', timeout: 3000 });
        }
        this.authService.registerCompany(company).subscribe(function (data) {
            if (data.success) {
                var iddd = data.company;
                console.log(data.company);
                _this.flashMessages.show('Your company is now registered ', { cssClass: 'alert-success', timeout: 3000 });
                _this.router.navigate(['login']);
            }
            else {
                console.log(data);
                _this.flashMessages.show('Something went wrong, you are not registered. Please try again!', { cssClass: 'alert-danger', timeout: 3000 });
                _this.router.navigate(['register']);
            }
        });
    };
    RegisterComponent.prototype.checkPass = function (f) {
        if (!this.validateService.ValidatePassword(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    RegisterComponent.prototype.checkEmail = function (f) {
        if (!this.validateService.ValidateEmail(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    RegisterComponent.prototype.checkInput = function (f) {
        if (!this.validateService.ValidateInput(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    RegisterComponent.prototype.checkDOB = function (f) {
        if (!this.validateService.ValidateInput(f) && !this.validateService.dobFormat(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    RegisterComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-register',
            template: __webpack_require__("./src/app/components/register/register.component.html"),
            providers: [__WEBPACK_IMPORTED_MODULE_3__services_auth_service__["a" /* AuthService */]],
            styles: [__webpack_require__("./src/app/components/register/register.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_4_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_3__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]])
    ], RegisterComponent);
    return RegisterComponent;
}());



/***/ }),

/***/ "./src/app/components/reminders/reminders.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/reminders/reminders.component.html":
/***/ (function(module, exports) {

module.exports = "<p>\n  reminders works!\n</p>\n"

/***/ }),

/***/ "./src/app/components/reminders/reminders.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RemindersComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var RemindersComponent = /** @class */ (function () {
    function RemindersComponent() {
    }
    RemindersComponent.prototype.ngOnInit = function () {
    };
    RemindersComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-reminders',
            template: __webpack_require__("./src/app/components/reminders/reminders.component.html"),
            styles: [__webpack_require__("./src/app/components/reminders/reminders.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], RemindersComponent);
    return RemindersComponent;
}());



/***/ }),

/***/ "./src/app/components/stages/stages.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/stages/stages.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"col-sm-12\" *ngIf=\"isEmpty()\">\n<form>\n    <div class=\"col-sm-12\">\n        <h4>Add Stage Group</h4>\n        <input #gname type=\"text\" class=\"form-control \" ><button (click)=\"addGroup(gname.value); gname.value=''\" class=\" btn btn-primary\">Add</button></div>\n    \n    <div class=\"col-sm-6\" *ngFor=\"let g of stages index as h\">\n       \n        <ul class=\"servicegroups col-sm-12\">\n            <h4>{{g.stage_title}}<span (click)=\"clearGroup(h)\" class=\"glyphicon glyphicon-remove\" style=\"color:red;\"></span></h4> \n            <li *ngFor=\"let info of stages[h].services index as i\">\n                <p>{{ info.title }} <span (click)=\"clearItemfromGroup(h,i)\" class=\"glyphicon glyphicon-remove\" style=\"color:red;\"></span></p>\n            </li>\n            <div class=\"col-sm-12 NewServiceInput\"><input #newInfo type=\"text\" class=\"form-control col-sm-10\">\n                <button (click)=\"addInputtoGroup(newInfo.value,h); newInfo.value=''; newInfo.focus()\" class=\"col-sm-2 btn btn-primary\">Add</button></div>\n          </ul>\n         \n          \n    </div>\n   <div class=\"col-sm-12\">\n       <button class=\"btn btn-primary\" [disabled]=\"isSaveDisabled()\" (click)=\"saveStages()\">SAVE</button>\n       \n   </div>\n</form>\n      \n</div>\n<div class=\"col-sm-12\" *ngIf=\"!isEmpty()\">\n        <h2>Project Services Included<button class=\"btn btn-primary\" (click)=\"toggleRemoveStageModal()\"><span class=\"glyphicon glyphicon-remove\"></span></button> </h2>\n        <ngb-tabset>\n            <ngb-tab *ngFor=\"let g of exStages[0].stages; index as h\" title=\"Stage {{h+1}}\" class=\"active\">\n              <ng-template ngbTabContent>\n                <h4 class=\"text-al--left col-sm-6\">  {{g.stage_title}} </h4>\n                  \n                  <div class=\"genBtn\">\n                    \n                    <!-- <button (click)=\"index_h = h; genEstimate()\" class=\"btn btn-primary dd-button\">\n                        Estimate\n                    </button>\n                    <button (click)=\"index_h = h; genInvoice()\" class=\"btn btn-primary dd-button \"  [disabled]=\"!g.completed\">\n                       Invoice\n                    </button> -->\n               </div>\n                <div class=\"table-responsive col-sm-12\">          \n                    <table class=\"table table-striped\">\n                      <thead>\n                        <tr>\n                          \n                         \n                          <th class=\"col-sm-4\">Title</th>\n                          <!-- <th class=\"col-sm-1\">Fee</th>\n                          <th class=\"col-sm-2\">Notes</th> -->\n                   \n                        </tr>\n                      </thead>\n                      <tbody>\n                        <tr *ngFor=\"let pro of g.services ; let i = index\" >\n                          <td class=\"text-al--left col-sm-6\"><p>{{pro.title}}</p></td>\n                          <!-- <td class=\"text-al--left col-sm-1\"><p>€ {{pro.fee}}</p></td>\n                          <td class=\"text-al--left col-sm-2\"><p>{{pro.notes}}</p></td> -->\n                         \n                        </tr>\n                      </tbody>\n                    </table>\n                    </div>\n                \n              </ng-template>\n            </ngb-tab>\n          </ngb-tabset>\n</div>\n\n<div id=\"RemoveStageModal\" class=\"FormModal\" >\n  <h1>Remove Project<i class=\"glyphicon glyphicon-remove\" (click)=\"toggleRemoveStageModal()\">\n</i></h1>\n\n  <form #l=\"ngForm\" >\n   \n    <div class=\"form-group col-sm-12\"><p>Are you sure you would like to remove this project?</p> \n     \n  </div>   \n  <button class=\"btn btn-primary\" (click)=\"removeStage()\"> Remove</button>\n  <button class=\"btn btn-action\" (click)=\"toggleRemoveStageModal()\"> Cancel</button>\n  </form>\n  </div>\n\n\n"

/***/ }),

/***/ "./src/app/components/stages/stages.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return StagesComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var StagesComponent = /** @class */ (function () {
    function StagesComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.gname = '';
        this.newInfo = '';
        this.SaveDisBtn = false;
        this.inputs = [];
        this.services = [{}];
        this.stages = [];
    }
    StagesComponent.prototype.isEmpty = function () {
        if (this.exStages == [] || this.exStages == undefined || this.exStages == null) {
            return true;
        }
        else {
            console.log(this.exStages.length <= 0);
            return this.exStages.length <= 0;
        }
    };
    StagesComponent.prototype.ngOnInit = function () {
        var _this = this;
        // let test=localStorage.getItem('isCompany');
        // if(test === 'false'){
        //   this.router.navigate(['/dashboard'])
        //   this.flashMessages.show('You have no access to Company Services.',{cssClass: 'alert-danger',timeout:3000});
        // }
        // else{
        //   this.authService.getCompany().subscribe(profile => {
        //     this.account = profile
        //     console.log(this.account);
        //   },
        //   err => {
        //     console.log(err);
        //     return false;
        //   });
        // }
        if (localStorage.getItem('isCompany') == 'true') {
            this.authService.getCompany().subscribe(function (profile) {
                _this.account = profile.company;
                _this.authService.getStages("").subscribe(function (profile) {
                    _this.exStages = profile.stage;
                    console.log(_this.exStages);
                }, function (err) {
                    console.log(err);
                    return false;
                });
                console.log(_this.account);
            }, function (err) {
                console.log(err);
                return false;
            });
        }
        else {
            this.flashMessages.show('Employees have no permission to view/edit/delete/update Stages.', { cssClass: 'alert-danger', timeout: 3000 });
            this.router.navigate(['dashboard']);
        }
    };
    StagesComponent.prototype.addInputtoGroup = function (newInfo, i) {
        if (newInfo) {
            this.stages[i].services.push({ title: newInfo });
            console.log(this.stages);
            newInfo = '';
        }
        else {
            this.flashMessages.show('Error Null Value, Please try again. ', { cssClass: 'alert-danger', timeout: 3000 });
        }
    };
    StagesComponent.prototype.addGroup = function (newValue) {
        if (newValue) {
            this.stages.push({
                stage_title: newValue,
                services: []
            });
            this.flashMessages.show('You have added a new Stage Group', { cssClass: 'alert-success', timeout: 3000 });
        }
        else {
            this.flashMessages.show('Error Null Value, Please try again.', { cssClass: 'alert-danger', timeout: 3000 });
        }
        newValue = '';
        console.log(this.stages);
    };
    StagesComponent.prototype.changes = function () {
        console.log(this.inputs);
    };
    StagesComponent.prototype.clearGroup = function (i) {
        if (i > -1) {
            this.stages.splice(i, 1);
        }
    };
    StagesComponent.prototype.clearItemfromGroup = function (h, i) {
        if (i > -1) {
            this.stages[h].services.splice(i, 1);
        }
    };
    StagesComponent.prototype.saveStages = function () {
        var _this = this;
        var ss = {
            stages: this.stages,
            compId: this.account
        };
        this.authService.addServices(ss).subscribe(function (data) {
            if (data.success) {
                console.log(data);
                _this.flashMessages.show('Completed, You have set up Company Services.', { cssClass: 'alert-success', timeout: 3000 });
                _this.ngOnInit();
            }
            else {
                console.log(data);
                _this.flashMessages.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
            }
        });
    };
    StagesComponent.prototype.updateStages = function () {
    };
    StagesComponent.prototype.removeStage = function () {
        var _this = this;
        this.authService.removeServices(this.exStages._id).subscribe(function (data) {
            _this.flashMessages.show('Completed, You have removed Company Services.', { cssClass: 'alert-success', timeout: 3000 });
        }, function (err) {
            _this.flashMessages.show(err, { cssClass: 'alert-danger', timeout: 3000 });
        });
        this.ngOnInit;
    };
    StagesComponent.prototype.setBtnDis = function () {
        this.SaveDisBtn = true;
    };
    StagesComponent.prototype.isSaveDisabled = function () {
        if ((this.stages[0] == undefined || this.stages[0] == null) && !this.stages.hasOwnProperty('services')) {
            return true;
        }
        else {
            return false;
        }
    };
    StagesComponent.prototype.toggleRemoveStageModal = function () {
        if (document.getElementById("RemoveStageModal").style.opacity == "1") {
            document.getElementById("RemoveStageModal").style.opacity = "0";
            document.getElementById("RemoveStageModal").style.display = "none";
        }
        else {
            document.getElementById("RemoveStageModal").style.display = "block";
            document.getElementById("RemoveStageModal").style.opacity = "1";
        }
    };
    StagesComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-stages',
            providers: [__WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */]],
            template: __webpack_require__("./src/app/components/stages/stages.component.html"),
            styles: [__webpack_require__("./src/app/components/stages/stages.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]])
    ], StagesComponent);
    return StagesComponent;
}());



/***/ }),

/***/ "./src/app/components/timesheet/timesheet.component.css":
/***/ (function(module, exports) {

module.exports = "\r\n\r\n\r\n.updateTimesheetForm{\r\n    font: 95% Arial, Helvetica, sans-serif;\r\n    width: 600px;\r\n    margin: 10px auto;\r\n    padding: 16px;\r\n    background: #F7F7F7;\r\n    position:fixed;\r\n    float: left;\r\n    top: 50%;\r\n    left: 50%;\r\n    -webkit-transform:  translate(-50%, -50%); /* Safari */\r\n    transform: translate(-50%, -50%);\r\n    -ms-transform:translate(-50%, -50%);\r\n    opacity:0;\r\n    -webkit-box-shadow: 5px 5px 18px #888888;\r\n            box-shadow: 5px 5px 18px #888888;\r\n    display:none;\r\n}\r\n.updateTimesheetForm h1{\r\n    background: #72002f;\r\n    padding: 20px 0;\r\n    font-size: 140%;\r\n    font-weight: 300;\r\n    text-align: center;\r\n    color: #fff;\r\n    margin: -16px -16px 16px -16px;\r\n}\r\n.updateTimesheetForm h1 i{\r\n    \r\n    position:absolute;\r\n    top:20px;\r\n    right:20px;\r\n\r\n}\r\n.updateTimesheetForm input[type=\"text\"],\r\n.updateTimesheetForm input[type=\"date\"],\r\n.updateTimesheetForm input[type=\"datetime\"],\r\n.updateTimesheetForm input[type=\"password\"],\r\n.updateTimesheetForm input[type=\"email\"],\r\n.updateTimesheetForm input[type=\"number\"],\r\n.updateTimesheetForm input[type=\"search\"],\r\n.updateTimesheetForm input[type=\"time\"],\r\n.updateTimesheetForm input[type=\"url\"],\r\n.updateTimesheetForm textarea,\r\n.updateTimesheetForm select \r\n{\r\n    -webkit-transition: all 0.30s ease-in-out;\r\n    -moz-transition: all 0.30s ease-in-out;\r\n    -ms-transition: all 0.30s ease-in-out;\r\n    -o-transition: all 0.30s ease-in-out;\r\n    outline: none;\r\n    box-sizing: border-box;\r\n    -webkit-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    width: 100%;\r\n    background: #fff;\r\n    margin-bottom: 4%;\r\n    border: 1px solid #ccc;\r\n    padding: 3%;\r\n    color: #555;\r\n    font: 95% Arial, Helvetica, sans-serif;\r\n}\r\n.updateTimesheetForm input[type=\"password\"]:focus,\r\n.updateTimesheetForm input[type=\"text\"]:focus,\r\n.updateTimesheetForm input[type=\"date\"]:focus,\r\n.updateTimesheetForm input[type=\"datetime\"]:focus,\r\n.updateTimesheetForm input[type=\"email\"]:focus,\r\n.updateTimesheetForm input[type=\"number\"]:focus,\r\n.updateTimesheetForm input[type=\"search\"]:focus,\r\n.updateTimesheetForm input[type=\"time\"]:focus,\r\n.updateTimesheetForm input[type=\"url\"]:focus,\r\n.updateTimesheetForm textarea:focus,\r\n.updateTimesheetForm select:focus\r\n{\r\n    -webkit-box-shadow: 0 0 5px #72002f;\r\n            box-shadow: 0 0 5px #72002f;\r\n    padding: 3%;\r\n    border: 1px solid #72002f;\r\n}\r\n.updateTimesheetForm input[type=\"submit\"],\r\n.updateTimesheetForm input[type=\"button\"]{\r\n    box-sizing: border-box;\r\n    -webkit-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    width: 100%;\r\n    padding: 3%;\r\n    background: #72002f;\r\n    border-bottom: 2px solid #72002f;\r\n    border-top-style: none;\r\n    border-right-style: none;\r\n    border-left-style: none;    \r\n    color: #fff;\r\n}\r\n.updateTimesheetForm input[type=\"submit\"]:hover,\r\n.updateTimesheetForm input[type=\"button\"]:hover{\r\n    background: #72002f;\r\n}"

/***/ }),

/***/ "./src/app/components/timesheet/timesheet.component.html":
/***/ (function(module, exports) {

module.exports = "\n<!-- Page Heading -->\n<div class=\"row\">\n  <div class=\"col-lg-12\">\n    <h1 class=\"page-header\">\n                      Timesheet Manager <small>List Overview</small>  <!--<button class=\"btn btn-primary\" (click)=\"toggleNew()\"><i class=\"glyphicon glyphicon-plus\"></i> Add New Project</button> -->\n                  </h1>\n    <ol class=\"breadcrumb\">\n      <li >\n        <i class=\"fa fa-dashboard\"></i> Dashboard\n      </li>\n      <li class=\"active\">\n          <i class=\"fa fa-dashboard\"></i> Timesheet Manager\n        </li>\n    </ol>\n  </div>\n</div>\n<!-- /.row -->\n\n \n<div class=\"row\">\n  <div class=\"col-sm-4\"><button class=\"btn btn-primary col-sm-12 text-al--center\" (click)=\"previousDay()\"><i class=\"glyphicon glyphicon-chevron-left\"></i>Previous Day</button></div>\n  <div class=\"col-sm-4\"><p class=\"label label-default col-sm-12 text-al--center fa-2x\">{{displayDate()}}</p></div>\n  <div class=\"col-sm-4\"><button class=\"btn btn-primary col-sm-12 text-al--center\" (click)=\"nextDay()\"> Next Day<i class=\"glyphicon glyphicon-chevron-right\"></i></button></div>\n  \n</div>\n  <div class=\"row\">\n    <div class=\"col-sm-12 table-responsive\">\n        <p class=\"label label-warning\" *ngIf=\"isCompany()\">Company Entity cannot save employee timesheets. Please sign in as employee user to log timesheets.</p>\n        <p class=\"label label-warning\" *ngIf=\"maxDayDiff()\">You can only enter your timesheets up to 14 days after timesheet date.</p>\n        <p class=\"label label-warning\" *ngIf=\"isNoProject()\">There are no projects currently active so no timesheets are allowed to be logged.</p>\n        <table class=\"table table-striped\" *ngIf=\"!isCompany() && (!isNoProject() && !maxDayDiff())\">\n            <thead>\n                <tr >\n                  <th>Date/Time</th>\n          \n                  <th>Client</th>\n                  <th>Project</th>\n                  <th>Stage</th>\n                  <th>Details</th>\n                </tr>\n              </thead>\n          <tbody>\n                         <tr *ngIf=\"!isCompany()&&!maxDayDiff()\">\n          <td class=\"text-al--left\">\n            <select class=\"form-control\" name=\"ts.hour\" [(ngModel)]=\"ts.hour\" (change)=\"time_picked1=true\">\n              <option  selected hidden>Choose Time</option>\n              <option  *ngFor=\"let t of time\" value=\"{{t}}\" >{{toTime(t)}}</option>\n            </select>\n        </td>\n        \n        <td class=\"text-al--left\">\n            <!-- <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"Details\" (change)=\"checkhour()\" [(ngModel)]=\"Details\" required >  -->\n          <select class=\"form-control\" name=\"ts.clientId\" [(ngModel)]=\"ts.clientId\" [disabled]=\"!time_picked1\" (change)=\"getProj($event); upCliInd($event); cli_picked=true\">\n              <option  selected hidden>Choose Stage</option>\n              <option  *ngFor=\"let cli of client; index as i\" value=\"{{cli.Name}}\" >{{cli.Name}}</option>\n            </select>\n        </td>\n        <td class=\"text-al--left\">\n            <!-- <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"Details\" (change)=\"checkhour()\" [(ngModel)]=\"Details\" required > -->\n        <select class=\"form-control\" name=\"ts.projectId\" [(ngModel)]=\"ts.projectId\" [disabled]=\"!cli_picked\"  (change)=\"upProInd($event); toggleStaFlag($event); pro_picked=true\">\n          <option  selected hidden>Choose Project</option>\n            <option value=\"{{j.title}}\" *ngFor=\"let j of project; index as k\" [hidden]=\"isEmpRelated(k)\">{{j.title}}</option>\n        </select>\n</td>\n        <td class=\"text-al--left\">\n            <!-- <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"Details\" (change)=\"checkhour()\" [(ngModel)]=\"Details\" required > -->\n            <select class=\"form-control\" name=\"ts.stageId\" [(ngModel)]=\"ts.stageId\" [disabled]=\"!pro_picked\" (change)=\"upStaInd($event)\">\n              <option   selected hidden>Choose Stage</option>\n                <option value=\"{{h.stage_title}}\" *ngFor=\"let h of project[proj_i].Services.stages\">{{h.stage_title}}</option>\n            </select>\n</td>\n        \n        <td class=\"text-al--left\">\n            <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"ts.Details\" (change)=\"checkhour()\" [(ngModel)]=\"ts.Details\" required >\n        </td>\n        <td class=\"text-al--left\">\n           <a class=\"btn btn-primary\" (click)=\"addTS()\">ADD</a>\n        </td>\n      </tr>  \n    </tbody>         \n  </table>\n    </div>\n    <div class=\"col-sm-12 table-responsive\">\n      <table class=\"table table-striped\" *ngIf=\"!isCompany() || !maxDayDiff()\">\n        <thead>\n            <tr >\n              <th>Date/Time</th>\n              <th>Entry Type</th>\n              \n              \n              <th>Details</th>\n            </tr>\n          </thead>\n      <tbody>\n      <tr *ngIf=\"!isCompany()&&!maxDayDiff()\">\n        <td class=\"text-al--left\">\n          <select class=\"form-control\" name=\"ts.hour\" [(ngModel)]=\"ts.hour\" (change)=\"time_picked2=true\" >\n            <option  selected hidden>Choose Time</option>\n            <option  *ngFor=\"let t of time\" value=\"{{t}}\" >{{toTime(t)}}</option>\n          </select>\n      </td>\n      <td class=\"text-al--left\">\n          <!-- <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"Details\" (change)=\"checkhour()\" [(ngModel)]=\"Details\" required >  -->\n        <select class=\"form-control\" name=\"ts.entryType\" [(ngModel)]=\"ts.entryType\" [disabled]=\"!time_picked2\" >\n            <option  selected hidden>Choose Entry Type</option>\n            <option  value=\"HolidayTime\" >Holiday Day</option>\n            <option  value=\"Lunch\" >Lunch</option>\n            <option  value=\"ProjectWork-Offline\" >Project Work - Offline</option>\n            <option  value=\"OutOfOffice\" >Out of Office</option>\n            <option  value=\"OfficeMeeting\" >Office Meeting</option>\n          </select>\n      </td>\n    \n      \n      <td class=\"text-al--left\">\n          <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"ts.Details\" (change)=\"checkhour()\" [(ngModel)]=\"ts.Details\" required >\n      </td>\n      <td class=\"text-al--left\">\n         <a class=\"btn btn-primary\" (click)=\"addTSType()\">ADD</a>\n      </td>\n    </tr> </tbody>         \n    </table></div>\n\n\n</div>\n<div class=\"row\">\n    <div class=\"col-lg-12\">\n        <h2 class=\"page-header\">\n          To Be Committed \n        </h2>\n      </div>\n    <form #g=\"ngForm\" (ngSubmit)=\"saveTS(g)\">\n    <div class=\"table-responsive col-sm-12\">          \n        <table class=\"table table-striped\">\n            <thead>\n              <tr >\n                <th>Date/Time</th>\n                <th>Entry Type</th>\n                <th>Client</th>\n                <th>Project</th>\n                <th>Stage</th>\n                <th>Details</th>\n              </tr>\n            </thead>\n            <tbody>\n              <tr *ngFor=\"let t of times.hourly_ts; let i = index\" >\n                  <td><p class=\"text-al--left\">{{toTime(t.hour)}}</p> </td>\n                  <td><p class=\"text-al--left\">{{t.entryType}}</p> </td>\n                  <td><p class=\"text-al--left\" *ngIf=\"t.client\">{{t.client.clTitle}}</p> </td>\n                  <td><p class=\"text-al--left\" *ngIf=\"t.project\">{{t.project.prTitle}}</p> </td>\n                  <td><p class=\"text-al--left\" *ngIf=\"t.stage\">{{t.stage.stTitle}}</p> </td>\n                  <td><p class=\"text-al--left\">{{t.Details}}</p> </td>\n              </tr>\n              \n            </tbody>\n            <tfoot><tr><td class=\"text-al--left\">\n                    <a class=\"btn btn-primary\" (click)=\"saveTS()\">SAVE</a>\n                 </td></tr>\n                \n            </tfoot>\n          </table>\n        </div>\n        </form>\n\n        <div class=\"col-lg-12\">\n            <h2 class=\"page-header\">\n              Committed Today\n            </h2>\n          </div>\n      <form #g=\"ngForm\" (ngSubmit)=\"saveTS(g)\">\n          <div class=\"table-responsive col-sm-12\">          \n              <table class=\"table table-striped\">\n                  <thead>\n                    <tr >\n                      <th>Date/Time</th>\n                      <th>Entry Type</th>\n                      <th>Client</th>\n                      <th>Project</th>\n                      <th>Stage</th>\n                      <th>Details</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr *ngFor=\"let t of ts_today.hourly_ts;  index as i\" [hidden]=\"!updateDateTS(i)\">\n                        <td><p class=\"text-al--left\">{{toTime(t.hour)}}</p> </td>\n                        <td><p class=\"text-al--left\">{{t.entryType}}</p> </td>\n                        <td><p class=\"text-al--left\" *ngIf=\"t.client\">{{t.client.clTitle}}</p> </td>\n                        <td><p class=\"text-al--left\" *ngIf=\"t.project\">{{t.project.prTitle}}</p> </td>\n                        <td><p class=\"text-al--left\" *ngIf=\"t.stage\">{{t.stage.stTitle}}</p> </td>\n                        <td><p class=\"text-al--left\">{{t.Details}}</p> </td>\n                    </tr>\n                    \n                  </tbody>\n             \n                </table>\n              </div>\n              </form>\n      \n</div><hr>\n<div class=\"row\">\n  <div class=\"col-sm-4\" *ngIf=\"account && !isCompany()\">\n    <h4>Timesheets by Project</h4>\n    <form #f=\"ngForm\" (ngSubmit)=\"viewTS(f)\">\n        <!-- <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"Details\" (change)=\"checkhour()\" [(ngModel)]=\"Details\" required >  -->\n      <select class=\"form-control col-sm-6\" name=\"selCLient\" [(ngModel)]=\"selClient\"  (change)=\"selbyProj1=true; getProj($event)\"  >\n          <option  selected hidden>Choose Client</option>\n          <option  *ngFor=\"let cli of client; index as i\" value=\"{{cli._id}}\" >{{cli.Name}}</option>\n        </select>\n \n   \n        <!-- <input type=\"text\" class=\"form-control\" id=\"inputReg\" name=\"Details\" (change)=\"checkhour()\" [(ngModel)]=\"Details\" required > -->\n    <select class=\"form-control  col-sm-6\" name=\"selProject\" *ngIf=\"selbyProj1\" [(ngModel)]=\"selProject\" [disabled]=\"!selbyProj1\"  (change)=\"selbyProj2=true; \">\n      <option  selected hidden>Choose Project</option>\n        <option value=\"{{j.ref}}\" *ngFor=\"let j of project; index as t\" [hidden]=\"isEmpRelated(t)\">{{j.title}}</option>\n    </select>\n    <button class=\"btn btn-primary col-sm-12\" type=\"submit\" [disabled]=\"!selbyProj1 && !selbyProj2\" >View Project Timesheets</button>\n  </form>\n  </div>\n  <div class=\"col-sm-4\" *ngIf=\"account && isCompany()\">\n    <form #r=\"ngForm\" (ngSubmit)=\"viewEmpTS(r)\">\n    <h4>Timesheets by Employee</h4>\n      <select class=\"form-control  col-sm-12\" name=\"selEmployee\" [(ngModel)]=\"selEmployee\">\n          <option  selected hidden>Choose Employee</option>\n            <option value=\"{{j._id}}\" *ngFor=\"let j of account.employees; index as k\" >{{j.empName}}</option>\n        </select>\n        <button type=\"submit\" class=\"btn btn-primary col-sm-12\" >View Employee Timesheets</button>\n      </form> \n  </div>\n  <div class=\"col-sm-4\" *ngIf=\"!isCompany()\">\n      <h4>Timesheets by Date</h4>\n      <!-- <form class=\"form-inline col-sm-12\">\n          <div class=\"form-group col-sm-12\">\n            <div class=\"input-group col-sm-12\">\n              <input class=\"form-control col-sm-12\" placeholder=\"yyyy-mm-dd\"\n                     name=\"dp\" [(ngModel)]=\"model\"  ngbDatepicker #d=\"ngbDatepicker\" style=\"width:inherit;\">\n              <div class=\"input-group-append\" style=\" margin:0 ; padding:0;\">\n                <button class=\"btn btn-outline-secondary\" (click)=\"d.toggle()\" type=\"button\" style=\" right:0;top:0;margin:0; padding:0;\"> \n                  <span class=\"glyphicon glyphicon-calendar\" style=\" cursor: pointer; font-size:.8em\"></span>\n                </button>\n              </div>\n            </div>\n          </div>\n        </form> -->\n      <button class=\"btn btn-primary col-sm-12\" (click)=\"viewDateTS();\">View Employee Timesheets</button>\n  </div>\n</div>\n<div id=\"RemoveProjModal\" class=\"FormModal\" >\n      <h1>Remove Project<i class=\"glyphicon glyphicon-remove\" (click)=\"closeModal()\">\n    </i></h1>\n    \n      <form #l=\"ngForm\" >\n       \n        <div class=\"form-group col-sm-12\"><p>Are you sure you would like to remove this project?</p> \n         \n      </div>   \n      <button class=\"btn btn-primary\" (click)=\"removeProject()\"> Remove</button>\n      <button class=\"btn btn-action\" (click)=\"toggleRemoveModal()\"> Cancel</button>\n      </form>\n      </div>\n\n  \n    \n    \n    \n    "

/***/ }),

/***/ "./src/app/components/timesheet/timesheet.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TimesheetComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__polyfills__ = __webpack_require__("./src/polyfills.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









var now = new Date();
var TimesheetComponent = /** @class */ (function () {
    function TimesheetComponent(validateService, flashMessages, authService, router, modalService, zone, // <== added
    dialog) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.modalService = modalService;
        this.zone = zone;
        this.dialog = dialog;
        this.ts_today = {
            hourly_ts: []
        };
        this.noProjects = false;
        this.selbyProj1 = false;
        this.selbyProj2 = false;
        this.time_picked1 = false;
        this.time_picked2 = false;
        this.pro_picked = false;
        this.cli_picked = false;
        this.date = new Date();
        this.serializedDate = new __WEBPACK_IMPORTED_MODULE_6__angular_forms__["b" /* FormControl */]((new Date()).toISOString());
        this.isLoggedin = false;
        this.setTimeStep = 0;
        this.project = [{ Services: {
                    stages: [{}, {}]
                } }];
        this.time = [8, 8.15, 8.30, 8.45, 9, 9.15, 9.30, 9.45, 10, 10.15, 10.30, 10.45, 11, 11.15, 11.30, 11.45, 12, 12.15, 12.30, 12.45, 13, 13.15, 13.30, 13.45, 14, 14.15, 14.30, 14.45, 15, 15.15, 15.30, 15.45, 16, 16.15, 16.30, 16.45, 17, 17.15, 17.30, 17.45, 18];
        this.times = {
            Date: "",
            hourly_ts: [],
            empUsername: ""
        };
        this.ts1 = [];
        this.ts = {
            hour: 0,
            clientId: "",
            projectId: "",
            stageId: "",
            Details: ""
        };
        this.sta_i = 0;
        this.proj_i = 0;
        this.cli_i = 0;
    }
    TimesheetComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.getDateToday();
        if (localStorage.getItem('isCompany') == 'true') {
            this.authService.getCompany().subscribe(function (profile) {
                _this.account = profile.company;
                _this.times.empUsername = _this.account.empUsername;
                console.log(_this.account);
                _this.authService.getClients(_this.account._id).subscribe(function (profile) {
                    _this.client = profile.client;
                    console.log(_this.client);
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
        else {
            this.authService.getProfile().subscribe(function (profile) {
                _this.account = profile.employee;
                console.log("it has made it into auth.getprofile subscription" + JSON.stringify(profile));
                _this._id = profile.employee._id;
                _this.authService.getEmployeeTimesheets(_this.account.empUsername).subscribe(function (data) {
                    _this.ts_ = data.timesheet;
                    console.log(_this.ts_);
                    for (var i = 0; i < _this.ts_.length; i++) {
                        console.log(_this.ts_[i]);
                        for (var j = 0; j < _this.ts_[i].hourly_ts.length; j++) {
                            console.log(_this.ts_[i].hourly_ts[j]);
                            // if(this.validateService.isSameDay(new Date(),this.validateService.ObjIdtoDate(this.ts_[i].hourly_ts[j]._id))){
                            _this.ts_today.hourly_ts.push(_this.ts_[i].hourly_ts[j]);
                            // }
                        }
                    }
                    _this.authService.getProjectbyComp(_this.account.compId).subscribe(function (data) {
                        if (data.project.length === 0)
                            _this.noProjects = true;
                        else
                            _this.noProjects = false;
                        console.log(_this.noProjects);
                    }, function (err) {
                    });
                }, function (err) {
                    console.log(err);
                    return false;
                });
                console.log(_this.account.compId);
                _this.authService.getClients(_this.account.compId).subscribe(function (profile) {
                    _this.client = profile.client;
                    console.log(_this.client);
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
    };
    TimesheetComponent.prototype.isNoProject = function () {
        return this.noProjects;
    };
    TimesheetComponent.prototype.checkhour = function () {
        console.log(this.times);
    };
    TimesheetComponent.prototype.toTime = function (t) {
        return parseFloat(t).toFixed(2);
    };
    TimesheetComponent.prototype.selectToday = function () {
        this.model = {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
        };
    };
    TimesheetComponent.prototype.setDate = function (d, m, y) {
        this.model = {
            year: d,
            month: m + 1,
            day: y,
        };
    };
    TimesheetComponent.prototype.isWeekend = function (date) {
        var d = new Date(date.year, date.month - 1, date.day);
        return d.getDay() === 0 || d.getDay() === 6;
    };
    TimesheetComponent.prototype.isCompany = function () {
        if (localStorage.getItem('isCompany') == 'true')
            return true;
        else
            return false;
    };
    TimesheetComponent.prototype.isEmpRelated = function (i) {
        if (this.project[i].EmpInvolved != undefined) {
            for (var j = 0; j < this.project[i].createdBy.length; j++) {
                if (this.project[i].createdBy[j] === this.account.empUsername) {
                    return false;
                }
            }
            for (var y = 0; y < this.project[i].EmpInvolved.length; y++) {
                if (this.project[i].EmpInvolved[y] === this.account.empUsername) {
                    return false;
                }
            }
            return true;
        }
        else {
            return true;
        }
    };
    TimesheetComponent.prototype.saveTS = function (l) {
        var _this = this;
        console.log(this.times);
        this.times.Date = this.getDateSubmit();
        // let d = new Date(l.value.date.year, l.value.date.month - 1, l.value.date.day);
        // console.log(d);
        // const ts = {
        //   empId:this._id,
        //   date:d,
        //   hours: new Array(l.value.day1,l.value.day2,l.value.day3,l.value.day4,l.value.day5,l.value.day6,l.value.day7),
        //   note:l.value.note,
        // }
        // console.log(ts);
        // // if(!this.validateService.ValidateCompRegister(company)){
        // //     console.log('Please fill in all fields');
        // //     this.flashMessages.show('Please fill in all the fields',{cssClass: 'alert-danger',timeout:3000});
        // // }
        this.authService.registerTimesheets(this.times).subscribe(function (data) {
            console.log(data);
            _this.flashMessages.show('You have added a new timesheet ', { cssClass: 'alert-success', timeout: 3000 });
            _this.ngOnInit();
            _this.times = {
                Date: "",
                hourly_ts: [],
                empUsername: ""
            };
            _this.ts_today = {
                hourly_ts: []
            };
        }, function (err) {
            _this.flashMessages.show(err, { cssClass: 'alert-danger', timeout: 3000 });
        });
    };
    TimesheetComponent.prototype.removeTS = function (i) {
        var _this = this;
        this.authService.removeTimesheet(this.ts_list.timesheet[i]).subscribe(function (data) {
            console.log(data.success);
            _this.flashMessages.show(data.msg, { cssClass: 'alert-success', timeout: 3000 });
            _this.ngOnInit();
        }, function (err) {
            _this.flashMessages.show('Something went wrong, timesheet did not remove. Please try again!', { cssClass: 'alert-danger', timeout: 3000 });
            return false;
        });
    };
    TimesheetComponent.prototype.getTotalHrs = function (i) {
        return this.ts_list.timesheet[i].hours[0] + this.ts_list.timesheet[i].hours[1] + this.ts_list.timesheet[i].hours[2] + this.ts_list.timesheet[i].hours[3] + this.ts_list.timesheet[i].hours[4] + this.ts_list.timesheet[i].hours[5] + this.ts_list.timesheet[i].hours[6];
    };
    TimesheetComponent.prototype.onTimesheetUpdate = function (f) {
        var _this = this;
        var d = new Date(f.value.dates.year, f.value.dates.month - 1, f.value.dates.day);
        var ts = {
            _id: this.ts_list.timesheet[this.ts_index]._id,
            empId: this._id,
            weekEnding: d,
            hours: new Array(f.value.upday1, f.value.upday2, f.value.upday3, f.value.upday4, f.value.upday5, f.value.upday6, f.value.upday7),
            note: f.value.note,
        };
        this.authService.updateTimesheet(ts).subscribe(function (data) {
            if (data.success) {
                _this.flashMessages.show('You have update a new timesheet ', { cssClass: 'alert-success', timeout: 3000 });
                _this.ngOnInit();
            }
            else {
                _this.flashMessages.show('Something went wrong, timesheet did not update. Please try again!', { cssClass: 'alert-danger', timeout: 3000 });
            }
        });
    };
    TimesheetComponent.prototype.addTS = function () {
        if (this.ts.clientId == "" || this.ts.hour == "" || this.ts.projectId == "" || this.ts.stageId == "" || this.ts.Details == "") {
            this.flashMessages.show('You have not fully filled out the timesheet logger! Please fill all areas to submit.', { cssClass: 'alert-danger', timeout: 3000 });
            return;
        }
        console.log(this.project[this.proj_i].Services.stages[this.sta_i]._id);
        var d = {
            hour: this.ts.hour,
            client: { clId: this.client[this.cli_i]._id, clTitle: this.ts.clientId },
            project: { prId: this.project[this.proj_i]._id, prTitle: this.ts.projectId },
            stage: { stId: this.project[this.proj_i].Services.stages[this.sta_i]._id, stTitle: this.ts.stageId },
            Details: this.ts.Details,
            empUsername: this.account.empUsername,
            date: this.date
        };
        var flag = false;
        console.log(this.ts_today);
        for (var i = 0; i < this.ts_today.hourly_ts.length; i++) {
            if (this.ts_today.hourly_ts[i].hour == d.hour && this.validateService.isSameDay(new Date(this.ts_today.hourly_ts[i].date), d.date) === true) {
                flag = true;
            }
        }
        for (var i = 0; i < this.times.hourly_ts.length; i++) {
            if (this.times.hourly_ts.length >= 0
                && this.times.hourly_ts[i].hour == d.hour
                && this.times.hourly_ts[i].empUsername == this.account.empUsername
                && this.validateService.isSameDay(this.times.hourly_ts[i].date, this.date) === true) {
                flag = true;
            }
        }
        // console.log(this.times.hourly_ts[i].hour);
        if (flag === false)
            this.times.hourly_ts.push(d);
        else
            this.flashMessages.show('You have already entered in work for this hour.', { cssClass: 'alert-danger', timeout: 3000 });
    };
    TimesheetComponent.prototype.upProInd = function (i) {
        this.proj_i = i.target.selectedIndex - 1;
    };
    TimesheetComponent.prototype.upCliInd = function (i) {
        this.cli_i = i.target.selectedIndex - 1;
    };
    TimesheetComponent.prototype.upStaInd = function (i) {
        this.sta_i = i.target.selectedIndex - 1;
    };
    TimesheetComponent.prototype.toggleNewTimesheetModal = function () {
        if (document.getElementById("addTimesheetForm").style.opacity == "1") {
            document.getElementById("addTimesheetForm").style.opacity = "0";
            document.getElementById("addTimesheetForm").style.display = "none";
        }
        else {
            document.getElementById("addTimesheetForm").style.display = "block";
            document.getElementById("addTimesheetForm").style.opacity = "1";
        }
    };
    TimesheetComponent.prototype.toggleUpdateTimesheetModal = function (i) {
        this.ts_index = i;
        if (document.getElementById("updateTimesheetForm").style.opacity == "1") {
            document.getElementById("updateTimesheetForm").style.opacity = "0";
            document.getElementById("updateTimesheetForm").style.display = "none";
        }
        else {
            // this.model = {
            //   year: new Date(this.ts_list.timesheet[this.ts_index].weekEnding).getFullYear, 
            //   month: new Date(this.ts_list.timesheet[this.ts_index].weekEnding).getMonth, 
            //   day: new Date(this.ts_list.timesheet[this.ts_index].weekEnding).getDate,
            // };
            var d = this.ts_list.timesheet[i].weekEnding.split("/");
            this.setDate(d[0], d[1], d[2]);
            document.getElementById("updateTimesheetForm").style.display = "block";
            document.getElementById("updateTimesheetForm").style.opacity = "1";
        }
    };
    TimesheetComponent.prototype.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 1 || date.getDay() === 2 || date.getDay() === 3 || date.getDay() === 4 || date.getDay() === 5));
    };
    TimesheetComponent.prototype.checkProj = function (i) {
        if (this.times.hourly_ts[i].projectId == "" || this.times.hourly_ts[i].projectId == null || this.times.hourly_ts[i].projectId == undefined || this.times.hourly_ts[i].projectId == "0") {
            return true;
        }
        else {
            return false;
        }
    };
    TimesheetComponent.prototype.checkCli = function (i) {
        if (this.times.hourly_ts[i].clientId == "" || this.times.hourly_ts[i].clientId == null || this.times.hourly_ts[i].clientId == undefined || this.times.hourly_ts[i].clientId == "0") {
            return true;
        }
        else {
            return false;
        }
    };
    TimesheetComponent.prototype.toggleStaFlag = function (i) {
        this.sta_i = i.target.selectedIndex - 1;
    };
    TimesheetComponent.prototype.getDateSubmit = function () {
        var today = new Date();
        //  let date = new Date(today.getFullYear(),today.getMonth(),today.getDay(),0,0,0);
        today.setHours(0);
        today.setMinutes(0);
        today.setMilliseconds(0);
        return today;
    };
    TimesheetComponent.prototype.getDateToday = function () {
        var today = new Date();
        //  let date = new Date(today.getFullYear(),today.getMonth(),today.getDay(),0,0,0);
        today.setHours(0);
        today.setMinutes(0);
        today.setMilliseconds(0);
        this.date = today;
        //return today.toDateString();
    };
    TimesheetComponent.prototype.maxDayDiff = function () {
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setMilliseconds(0);
        if (this.datediff(this.date, today) > 14)
            return true;
        else
            return false;
    };
    TimesheetComponent.prototype.getProj = function (i) {
        var _this = this;
        this.cli_i = i.target.selectedIndex - 1;
        this.authService.getProjectsbyClient(this.client[this.cli_i]._id).subscribe(function (profile) {
            _this.project = profile.project;
            console.log(_this.project);
        }, function (err) {
            return false;
        });
    };
    TimesheetComponent.prototype.viewTS = function (i) {
        console.log(i);
        this.router.navigate(['/timesheets', i.value.selProject]);
    };
    TimesheetComponent.prototype.viewDateTS = function () {
        this.router.navigate(['/tsbydate']);
    };
    TimesheetComponent.prototype.parseDate = function (str) {
        var mdy = str.split('/');
        return new Date(mdy[2], mdy[0] - 1, mdy[1]);
    };
    TimesheetComponent.prototype.datediff = function (first, second) {
        // Take the difference between the dates and divide by milliseconds per day.
        // Round to nearest whole number to deal with DST.
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    };
    TimesheetComponent.prototype.nextDay = function () {
        var today = new Date();
        var temp = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate(), 0, 0, 0);
        temp.setDate(temp.getDate() + 1);
        if (new Date(temp) < new Date(today))
            this.date.setDate(this.date.getDate() + 1);
        else
            this.flashMessages.show("You can go to date that hasn't happened yet", { cssClass: 'alert-danger', timeout: 3000 });
    };
    TimesheetComponent.prototype.viewEmpTS = function (i) {
        console.log(i);
        this.router.navigate(['/timesheets', i.value.selEmployee]);
    };
    TimesheetComponent.prototype.previousDay = function () {
        this.date.setDate(this.date.getDate() - 1);
    };
    TimesheetComponent.prototype.updateDateTS = function (i) {
        if (this.validateService.isSameDay(this.date, new Date(this.ts_today.hourly_ts[i].date)))
            return true;
        else
            return false;
    };
    TimesheetComponent.prototype.displayDate = function () {
        return this.date.toDateString();
    };
    TimesheetComponent.prototype.changeIdtoDate = function (t) {
        var date = this.validateService.ObjIdtoDate(t);
        return date.toDateString();
    };
    TimesheetComponent.prototype.addTSType = function () {
        if (this.ts.entryType == "" || this.ts.hour == "" || this.ts.Details == "") {
            this.flashMessages.show('You have not fully filled out the timesheet logger! Please fill all areas to submit.', { cssClass: 'alert-danger', timeout: 3000 });
            return;
        }
        console.log(this.project[this.proj_i].Services.stages[this.sta_i]._id);
        var d = {
            hour: this.ts.hour,
            entryType: this.ts.entryType,
            Details: this.ts.Details,
            empUsername: this.account.empUsername,
            date: this.date
        };
        var flag = false;
        console.log(this.ts_today);
        for (var i = 0; i < this.ts_today.hourly_ts.length; i++) {
            if (this.ts_today.hourly_ts[i].hour == d.hour && this.validateService.isSameDay(new Date(this.ts_today.hourly_ts[i].date), d.date) === true) {
                flag = true;
            }
        }
        for (var i = 0; i < this.times.hourly_ts.length; i++) {
            if (this.times.hourly_ts.length >= 0
                && this.times.hourly_ts[i].hour == d.hour
                && this.times.hourly_ts[i].empUsername == this.account.empUsername
                && this.validateService.isSameDay(this.times.hourly_ts[i].date, this.date) === true) {
                flag = true;
            }
        }
        // console.log(this.times.hourly_ts[i].hour);
        if (flag === false)
            this.times.hourly_ts.push(d);
        else
            this.flashMessages.show('You have already entered in work for this hour.', { cssClass: 'alert-danger', timeout: 3000 });
    };
    TimesheetComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-timesheet',
            template: __webpack_require__("./src/app/components/timesheet/timesheet.component.html"),
            styles: [__webpack_require__("./src/app/components/timesheet/timesheet.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */],
            __WEBPACK_IMPORTED_MODULE_0__angular_core__["NgZone"],
            __WEBPACK_IMPORTED_MODULE_8__angular_material__["i" /* MatDialog */]])
    ], TimesheetComponent);
    return TimesheetComponent;
}());



/***/ }),

/***/ "./src/app/components/timesheet/view-by-date/view-by-date.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/timesheet/view-by-date/view-by-date.component.html":
/***/ (function(module, exports) {

module.exports = "<!-- Page Heading -->\n<div class=\"row\">\n    <div class=\"col-lg-12\">\n      <h1 class=\"page-header\">\n                        Timesheet View:<small>By Date</small>\n                    </h1>\n      <ol class=\"breadcrumb\">\n        <li >\n          <i class=\"fa fa-dashboard\"></i> Dashboard\n        </li>\n        <li >\n            <i class=\"fa fa-dashboard\"></i> Timesheet Manager\n          </li>\n        <li class=\"active\">\n            <i class=\"fa fa-dashboard\"></i> View Timesheet By Date\n          </li>\n      </ol>\n    </div>\n  </div>\n  <!-- /.row -->\n  <div class=\"row\">\n    <div class=\"col-sm-4\"><button class=\"btn btn-primary col-sm-12\" (click)=\"nextDay()\"><i class=\"glyphicon glyphicon-chevron-left\"></i> Previous Day</button></div>\n    <div class=\"col-sm-4\"><p class=\"label label-default col-sm-12 text-al--center fa-2x\">{{displayDate()}}</p></div>\n    <div class=\"col-sm-4\"><button class=\"btn btn-primary col-sm-12\" (click)=\"previousDay()\">Next Day <i class=\"glyphicon glyphicon-chevron-right\"></i></button></div>\n\n  </div>\n<div class=\"table-responsive col-sm-12\">          \n    <table class=\"table table-striped\">\n        <thead>\n          <tr >\n  \n            <th>Time</th>\n            <th>Entry Type</th>\n            <th>Client</th>\n            <th>Project</th>\n            <th>Stage</th>\n            <th>Details</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr *ngFor=\"let t of ts_list.hourly_ts; index as i\" [hidden]=\"!updateDateTS(i)\">\n         \n              <td><p class=\"text-al--left\">{{toTime(t.hour)}}</p> </td>\n              <td><p class=\"text-al--left\">{{t.entryType}}</p> </td>\n              <td><p class=\"text-al--left\" *ngIf=\"t.client\">{{t.client.clTitle}}</p> </td>\n              <td><p class=\"text-al--left\" *ngIf=\"t.project\">{{t.project.prTitle}}</p> </td>\n              <td><p class=\"text-al--left\" *ngIf=\"t.stage\">{{t.stage.stTitle}}</p> </td>\n              <td><p class=\"text-al--left\">{{t.Details}}</p> </td>\n          </tr>\n          \n        </tbody>\n        \n      </table>\n    </div>"

/***/ }),

/***/ "./src/app/components/timesheet/view-by-date/view-by-date.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ViewByDateComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var ViewByDateComponent = /** @class */ (function () {
    function ViewByDateComponent(validateService, flashMessages, authService, router, modalService, zone, // <== added
    dialog) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.modalService = modalService;
        this.zone = zone;
        this.dialog = dialog;
        this.ts_list = {
            hourly_ts: []
        };
    }
    ViewByDateComponent.prototype.isCompany = function () {
        if (localStorage.getItem('isCompany') == 'true') {
            return true;
        }
        else {
            return false;
        }
    };
    ViewByDateComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.date = new Date();
        if (this.isCompany()) {
        }
        else {
            this.authService.getProfile().subscribe(function (data) {
                _this.account = data.employee;
                _this.authService.getEmployeeTimesheets(_this.account.empUsername).subscribe(function (data) {
                    _this.ts_ = data.timesheet;
                    console.log(_this.ts_);
                    for (var i = 0; i < _this.ts_.length; i++) {
                        console.log(_this.ts_[i]);
                        for (var j = 0; j < _this.ts_[i].hourly_ts.length; j++) {
                            // if(this.validateService.isSameDay(this.date,this.validateService.ObjIdtoDate(this.ts_[i].hourly_ts[j]._id))){
                            _this.ts_list.hourly_ts.push(_this.ts_[i].hourly_ts[j]);
                            //}
                        }
                    }
                }, function (err) {
                    console.log(err);
                    return false;
                });
            }, function (err) {
                console.log(err);
                return false;
            });
        }
        console.log(this.ts_list.hourly_ts);
    };
    ViewByDateComponent.prototype.nextDay = function () {
        this.date.setDate(this.date.getDate() - 1);
        console.log(this.date.toDateString());
    };
    ViewByDateComponent.prototype.previousDay = function () {
        this.date.setDate(this.date.getDate() + 1);
        console.log(this.date.toDateString());
    };
    ViewByDateComponent.prototype.updateDateTS = function (i) {
        if (this.validateService.isSameDay(this.date, new Date(this.ts_list.hourly_ts[i].date)))
            return true;
        else
            return false;
    };
    ViewByDateComponent.prototype.displayDate = function () {
        return this.date.toDateString();
    };
    ViewByDateComponent.prototype.toTime = function (t) {
        return parseFloat(t).toFixed(2);
    };
    ViewByDateComponent.prototype.changeIdtoDate = function (t) {
        var date = this.validateService.ObjIdtoDate(t);
        return date.toDateString();
    };
    ViewByDateComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-view-by-date',
            template: __webpack_require__("./src/app/components/timesheet/view-by-date/view-by-date.component.html"),
            styles: [__webpack_require__("./src/app/components/timesheet/view-by-date/view-by-date.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */],
            __WEBPACK_IMPORTED_MODULE_0__angular_core__["NgZone"],
            __WEBPACK_IMPORTED_MODULE_6__angular_material__["i" /* MatDialog */]])
    ], ViewByDateComponent);
    return ViewByDateComponent;
}());



/***/ }),

/***/ "./src/app/components/timesheet/view-timesheet/view-timesheet.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/timesheet/view-timesheet/view-timesheet.component.html":
/***/ (function(module, exports) {

module.exports = " <!-- Page Heading -->\n <div class=\"row\">\n    <div class=\"col-lg-12\">\n      <h1 class=\"page-header\">\n                        Timesheet View: <small *ngIf=\"ts\">By Project </small>\n                    </h1>\n      <ol class=\"breadcrumb\">\n        <li >\n          <i class=\"fa fa-dashboard\"></i> Dashboard\n        </li>\n        <li >\n            <i class=\"fa fa-dashboard\"></i> Timesheet Manager\n          </li>\n        <li class=\"active\">\n            <i class=\"fa fa-dashboard\"></i> View Timesheets By Project\n          </li>\n      </ol>\n    </div>\n  </div>\n  <!-- /.row -->\n<div class=\"row\">\n    \n    <hr>\n    <ngb-tabset>\n        <ngb-tab *ngFor=\"let g of project.Services.stages; index as h\" title=\"Stage {{h+1}}\" class=\"active\">\n          <ng-template ngbTabContent>\n            <h4 class=\"text-al--left col-sm-6\"><i class=\"glyphicon glyphicon-tag\" [ngStyle]=\"{\n              color: budgetIndicator(h)}\" style=\" text-shadow: 2px 2px 5px #bbb;\" *ngIf=\"isUserLead()\"> </i> {{g.stage_title}} </h4>\n              \n              \n           <div class=\"table-responsive col-sm-12\">          \n              <table class=\"table table-striped\">\n                  <thead>\n                    <tr >\n                      <th>Date</th>\n                      <th>Time</th>\n                      <th>Employee</th>\n                      <th>Client</th>\n                      <th>Project</th>\n                      <th>Stage</th>\n                      <th>Details</th>\n                    </tr>\n                  </thead>\n                  <tbody>\n                    <tr *ngFor=\"let t of ts_stages[h]; let i = index\">\n                        <td><p class=\"text-al--left\">{{changeIdtoDate(t.date)}}</p> </td>\n                        <td><p class=\"text-al--left\">{{t.hour}}</p> </td>\n                        <td><p class=\"text-al--left\">{{t.empUsername}}</p> </td>\n                        <td><p class=\"text-al--left\">{{t.client.clTitle}}</p> </td>\n                        <td><p class=\"text-al--left\">{{t.project.prTitle}}</p> </td>\n                        <td><p class=\"text-al--left\">{{t.stage.stTitle}}</p> </td>\n                        <td><p class=\"text-al--left\">{{t.Details}}</p> </td>\n                    </tr>\n                    \n                  </tbody>\n                  \n                </table>\n              </div>\n            \n          </ng-template>\n        </ngb-tab>\n      </ngb-tabset>\n         \n\n         <button class=\"btn btn-primary\" (click)=\"updateProgress()\" [disabled]=\"!updateflag\">UPDATE</button>\n\n\n\n\n</div>\n    \n      \n    \n        \n\n   "

/***/ }),

/***/ "./src/app/components/timesheet/view-timesheet/view-timesheet.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ViewTimesheetComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};







var ViewTimesheetComponent = /** @class */ (function () {
    function ViewTimesheetComponent(window, validateService, flashMessages, authService, router, route, modalService, zone, // <== added
    dialog) {
        this.window = window;
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.route = route;
        this.modalService = modalService;
        this.zone = zone;
        this.dialog = dialog;
        this.project = { Services: {
                stages: [{}, {}]
            } };
        this.ts_budget = [];
        this.ts_stages = [];
    }
    ViewTimesheetComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (localStorage.getItem('isCompany') == "true") {
            this.authService.getCompany().subscribe(function (data) {
                for (var i = 0; i > data.company.employees.length; i++) {
                    if (data.company.employees[i]._id == _this.route.snapshot.params['id']) {
                        _this.account = data.company.employees[i];
                    }
                }
                _this.authService.getProjectbyId(_this.route.snapshot.params['id']).subscribe(function (profile) {
                    _this.project = profile.project[0];
                    //   console.log(this.project);
                    _this.authService.getBudgetTimesheets(_this.project._id).subscribe(function (data) {
                        _this.ts = data.timesheet;
                        //    console.log(this.ts);
                        //looping through stages of services 
                        for (var i = 0; i < _this.project.Services.stages.length; i++) {
                            var tsi = 0;
                            var arr = [];
                            //    console.log('it got in');
                            //looping through the array of timesheet days
                            for (var j = 0; j < _this.ts.length; j++) {
                                //    console.log(this.ts[j]);
                                //looping through the array of timesheet hours
                                for (var k = 0; k < _this.ts[j].hourly_ts.length; k++) {
                                    //    console.log(this.project.Services.stages[i]._id +"////"+this.ts[j].hourly_ts[k].stage.stId);
                                    if (_this.project.Services.stages[i]._id === _this.ts[j].hourly_ts[k].stage.stId) {
                                        tsi++;
                                        arr.push(_this.ts[j].hourly_ts[k]);
                                        //      console.log("arr: "+arr);
                                    }
                                }
                            }
                            _this.ts_stages.push(arr);
                            //     console.log(this.ts_stages); 
                            tsi = tsi * parseFloat(_this.account.empHrRate);
                            //     console.log(tsi)
                            _this.ts_budget.push(tsi);
                        }
                        //       console.log(this.ts_budget);
                    }, function (err) {
                        //        console.log(err);
                        return false;
                    });
                }, function (err) {
                    //   console.log(err);
                    _this.router.navigate(['/timesheets']);
                    return false;
                });
            });
        }
        else {
            this.authService.getProfile().subscribe(function (data) {
                _this.account = data.employee;
                //   console.log(this.route.snapshot.params['id']);
                _this.authService.getProjectbyId(_this.route.snapshot.params['id']).subscribe(function (profile) {
                    _this.project = profile.project[0];
                    //   console.log(this.project);
                    _this.authService.getBudgetTimesheets(_this.project._id).subscribe(function (data) {
                        _this.ts = data.timesheet;
                        //    console.log(this.ts);
                        //looping through stages of services 
                        for (var i = 0; i < _this.project.Services.stages.length; i++) {
                            var tsi = 0;
                            var arr = [];
                            //    console.log('it got in');
                            //looping through the array of timesheet days
                            for (var j = 0; j < _this.ts.length; j++) {
                                //    console.log(this.ts[j]);
                                //looping through the array of timesheet hours
                                for (var k = 0; k < _this.ts[j].hourly_ts.length; k++) {
                                    //    console.log(this.project.Services.stages[i]._id +"////"+this.ts[j].hourly_ts[k].stage.stId);
                                    if (_this.project.Services.stages[i]._id === _this.ts[j].hourly_ts[k].stage.stId) {
                                        tsi++;
                                        arr.push(_this.ts[j].hourly_ts[k]);
                                        //      console.log("arr: "+arr);
                                    }
                                }
                            }
                            _this.ts_stages.push(arr);
                            //     console.log(this.ts_stages); 
                            tsi = tsi * parseFloat(_this.account.empHrRate);
                            //     console.log(tsi)
                            _this.ts_budget.push(tsi);
                        }
                        //       console.log(this.ts_budget);
                    }, function (err) {
                        //        console.log(err);
                        return false;
                    });
                }, function (err) {
                    //   console.log(err);
                    _this.router.navigate(['/timesheets']);
                    return false;
                });
            }, function (err) {
                //    console.log(err);
                return false;
            });
        }
    };
    ViewTimesheetComponent.prototype.budgetIndicator = function (i) {
        //  console.log("index:"+i+"\n budget[i]:"+this.ts_budget[i]+"\n STAGE-BUDGET: "+this.project.Services.stages[i].budget)
        var budget_perc = (this.ts_budget[i] / this.project.Services.stages[i].budget) * 100;
        // console.log(budget_perc);
        if (budget_perc > 95) {
            return 'red';
        }
        else if (budget_perc > 80) {
            return 'yellow';
        }
        else {
            return 'green';
        }
    };
    ViewTimesheetComponent.prototype.changeIdtoDate = function (t) {
        return new Date(t).toDateString();
    };
    ViewTimesheetComponent.prototype.isUserLead = function () {
        var flag = false;
        for (var i = 0; i <= this.project.createdBy.length; i++) {
            if (this.account.empUsername === this.project.createdBy[i]) {
                flag = true;
            }
        }
        if (flag)
            return true;
        else
            return false;
    };
    ViewTimesheetComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-view-timesheet',
            template: __webpack_require__("./src/app/components/timesheet/view-timesheet/view-timesheet.component.html"),
            styles: [__webpack_require__("./src/app/components/timesheet/view-timesheet/view-timesheet.component.css")],
            providers: [
                { provide: 'Window', useValue: window }
            ]
        }),
        __param(0, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Inject"])('Window')),
        __metadata("design:paramtypes", [Window,
            __WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["a" /* ActivatedRoute */],
            __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */],
            __WEBPACK_IMPORTED_MODULE_0__angular_core__["NgZone"],
            __WEBPACK_IMPORTED_MODULE_6__angular_material__["i" /* MatDialog */]])
    ], ViewTimesheetComponent);
    return ViewTimesheetComponent;
}());



/***/ }),

/***/ "./src/app/components/utils/calendar-header.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CalendarHeaderComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var CalendarHeaderComponent = /** @class */ (function () {
    function CalendarHeaderComponent() {
        this.locale = 'en';
        this.viewChange = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["EventEmitter"]();
        this.viewDateChange = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["EventEmitter"]();
    }
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", String)
    ], CalendarHeaderComponent.prototype, "view", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", Date)
    ], CalendarHeaderComponent.prototype, "viewDate", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", String)
    ], CalendarHeaderComponent.prototype, "locale", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Output"])(),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_0__angular_core__["EventEmitter"])
    ], CalendarHeaderComponent.prototype, "viewChange", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Output"])(),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_0__angular_core__["EventEmitter"])
    ], CalendarHeaderComponent.prototype, "viewDateChange", void 0);
    CalendarHeaderComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'mwl-utils-calendar-header',
            template: "\n    <div class=\"row text-center\">\n      <div class=\"col-md-4\">\n        <div class=\"btn-group\">\n          <div\n            class=\"btn btn-primary\"\n            mwlCalendarPreviousView\n            [view]=\"view\"\n            [(viewDate)]=\"viewDate\"\n            (viewDateChange)=\"viewDateChange.next(viewDate)\">\n            Previous\n          </div>\n          <div\n            class=\"btn btn-outline-secondary\"\n            mwlCalendarToday\n            [(viewDate)]=\"viewDate\"\n            (viewDateChange)=\"viewDateChange.next(viewDate)\">\n            Today\n          </div>\n          <div\n            class=\"btn btn-primary\"\n            mwlCalendarNextView\n            [view]=\"view\"\n            [(viewDate)]=\"viewDate\"\n            (viewDateChange)=\"viewDateChange.next(viewDate)\">\n            Next\n          </div>\n        </div>\n      </div>\n      <div class=\"col-md-4\">\n        <h3>{{ viewDate | calendarDate:(view + 'ViewTitle'):locale }}</h3>\n      </div>\n      <div class=\"col-md-4\">\n        <div class=\"btn-group\">\n          <div\n            class=\"btn btn-primary\"\n            (click)=\"viewChange.emit('month')\"\n            [class.active]=\"view === 'month'\">\n            Month\n          </div>\n          <div\n            class=\"btn btn-primary\"\n            (click)=\"viewChange.emit('week')\"\n            [class.active]=\"view === 'week'\">\n            Week\n          </div>\n          <div\n            class=\"btn btn-primary\"\n            (click)=\"viewChange.emit('day')\"\n            [class.active]=\"view === 'day'\">\n            Day\n          </div>\n        </div>\n      </div>\n    </div>\n    <br>\n  "
        })
    ], CalendarHeaderComponent);
    return CalendarHeaderComponent;
}());



/***/ }),

/***/ "./src/app/components/utils/date-time-picker.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export DATE_TIME_PICKER_CONTROL_VALUE_ACCESSOR */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DateTimePickerComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_date_fns__ = __webpack_require__("./node_modules/date-fns/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_date_fns___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_date_fns__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/esm5/forms.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var DATE_TIME_PICKER_CONTROL_VALUE_ACCESSOR = {
    provide: __WEBPACK_IMPORTED_MODULE_2__angular_forms__["f" /* NG_VALUE_ACCESSOR */],
    useExisting: Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["forwardRef"])(function () { return DateTimePickerComponent; }),
    multi: true
};
var DateTimePickerComponent = /** @class */ (function () {
    function DateTimePickerComponent(cdr) {
        this.cdr = cdr;
        this.onChangeCallback = function () { };
    }
    DateTimePickerComponent.prototype.writeValue = function (date) {
        this.date = date;
        this.dateStruct = {
            day: Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["getDate"])(date),
            month: Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["getMonth"])(date) + 1,
            year: Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["getYear"])(date)
        };
        this.timeStruct = {
            second: Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["getSeconds"])(date),
            minute: Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["getMinutes"])(date),
            hour: Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["getHours"])(date)
        };
        this.cdr.detectChanges();
    };
    DateTimePickerComponent.prototype.registerOnChange = function (fn) {
        this.onChangeCallback = fn;
    };
    DateTimePickerComponent.prototype.registerOnTouched = function (fn) { };
    DateTimePickerComponent.prototype.updateDate = function () {
        var newDate = Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["setYear"])(Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["setMonth"])(Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["setDate"])(this.date, this.dateStruct.day), this.dateStruct.month - 1), this.dateStruct.year);
        this.writeValue(newDate);
        this.onChangeCallback(newDate);
    };
    DateTimePickerComponent.prototype.updateTime = function () {
        var newDate = Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["setHours"])(Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["setMinutes"])(Object(__WEBPACK_IMPORTED_MODULE_1_date_fns__["setSeconds"])(this.date, this.timeStruct.second), this.timeStruct.minute), this.timeStruct.hour);
        this.writeValue(newDate);
        this.onChangeCallback(newDate);
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
        __metadata("design:type", String)
    ], DateTimePickerComponent.prototype, "placeholder", void 0);
    DateTimePickerComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'mwl-utils-date-time-picker',
            template: "\n    <form class=\"form-inline\">\n      <div class=\"form-group\">\n        <div class=\"input-group\">\n          <input\n            readonly\n            class=\"form-control\"\n            [placeholder]=\"placeholder\"\n            name=\"date\"\n            [(ngModel)]=\"dateStruct\"\n            (ngModelChange)=\"updateDate()\"\n            ngbDatepicker\n            #datePicker=\"ngbDatepicker\">\n            <div class=\"input-group-append\" (click)=\"datePicker.toggle()\" >\n              <span class=\"input-group-text\"><i class=\"glyphicon glyphicon-calendar\"></i></span>\n            </div>\n        </div>\n      </div>\n    </form>\n    <ngb-timepicker\n      [(ngModel)]=\"timeStruct\"\n      (ngModelChange)=\"updateTime()\"\n      [meridian]=\"true\">\n    </ngb-timepicker>\n  ",
            styles: [
                "\n    .form-group {\n      width: 100%;\n    }\n  "
            ],
            providers: [DATE_TIME_PICKER_CONTROL_VALUE_ACCESSOR]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_0__angular_core__["ChangeDetectorRef"]])
    ], DateTimePickerComponent);
    return DateTimePickerComponent;
}());



/***/ }),

/***/ "./src/app/components/utils/module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UtilsModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common__ = __webpack_require__("./node_modules/@angular/common/esm5/common.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__("./node_modules/@angular/forms/esm5/forms.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_angular_calendar__ = __webpack_require__("./node_modules/angular-calendar/esm5/angular-calendar.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__calendar_header_component__ = __webpack_require__("./src/app/components/utils/calendar-header.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__date_time_picker_component__ = __webpack_require__("./src/app/components/utils/date-time-picker.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};







var UtilsModule = /** @class */ (function () {
    function UtilsModule() {
    }
    UtilsModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["NgModule"])({
            imports: [
                __WEBPACK_IMPORTED_MODULE_1__angular_common__["CommonModule"],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["d" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_3__ng_bootstrap_ng_bootstrap__["a" /* NgbDatepickerModule */].forRoot(),
                __WEBPACK_IMPORTED_MODULE_3__ng_bootstrap_ng_bootstrap__["e" /* NgbTimepickerModule */].forRoot(),
                __WEBPACK_IMPORTED_MODULE_4_angular_calendar__["a" /* CalendarModule */]
            ],
            declarations: [__WEBPACK_IMPORTED_MODULE_5__calendar_header_component__["a" /* CalendarHeaderComponent */], __WEBPACK_IMPORTED_MODULE_6__date_time_picker_component__["a" /* DateTimePickerComponent */]],
            exports: [__WEBPACK_IMPORTED_MODULE_5__calendar_header_component__["a" /* CalendarHeaderComponent */], __WEBPACK_IMPORTED_MODULE_6__date_time_picker_component__["a" /* DateTimePickerComponent */]]
        })
    ], UtilsModule);
    return UtilsModule;
}());



/***/ }),

/***/ "./src/app/components/view-company-profile/select-employee/select-employee.component.css":
/***/ (function(module, exports) {

module.exports = ""

/***/ }),

/***/ "./src/app/components/view-company-profile/select-employee/select-employee.component.html":
/***/ (function(module, exports) {

module.exports = "\n<div class=\"row\">\n    <div class=\"col-lg-12\" *ngIf=\"account\">\n      <h1 class=\"page-header\" >\n                        {{account.empName}} <small *ngIf=\"account\">Profile View</small>\n                    </h1>\n      <ol class=\"breadcrumb\">\n        <li >\n          <i class=\"fa fa-dashboard\"></i> Dashboard\n        </li>\n        <li >\n            <i class=\"fa fa-dashboard\"></i> Profile\n          </li>\n          <li >\n              <i class=\"fa fa-dashboard\"></i>{{account.empName}}\n            </li>\n      </ol>\n    </div>\n  </div>\n<div class=\"col-sm-12 viewprofile\">\n\n  <div class=\"col-sm-3\">\n      <img class=\"img-responsive img-circle addMargin\" src=\"../../../../assets/images/defaultprofile.jpeg\" alt=\"\"> \n      <button class=\"btn btn-primary col-sm-12\" (click)=\"EditUser()\"><i [ngClass]=\"editMode ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus'\" ></i>Edit Mode </button> \n  </div>\n  <div class=\"col-sm-9 \" *ngIf=\"account && !editMode\">\n     \n      <div class=\"col-sm-12 \">\n        <h2 class=\"prim text-al--left\">PERSONAL INFORMATION</h2>\n      <h4 class=\"dark text-al--left\">Email<br> <small>{{account.empEmail}}</small></h4>\n      \n      \n      <h4 class=\"dark text-al--left\">Username<br><small>{{account.empUsername}}</small></h4>\n      \n      <h4 class=\"dark text-al--left\">Position<br><small>\n        {{account.empPosition}}\n      </small></h4>\n      \n       <h4 class=\"dark text-al--left\">Phone Number<br><small> {{account.empPhone}}</small></h4>\n       <h4 class=\"dark text-al--left\">Wage per Hour<br><small> €{{account.empHrRate}}</small></h4>\n      \n       <h4 class=\"dark text-al--left\">Date of Birth<Br><small> {{account.empDob}}</small></h4>\n      </div>\n  </div>\n  <div class=\"col-sm-9 \" *ngIf=\"account && editMode\">\n     \n      <div class=\"col-sm-12 \">\n        <form #f=\"ngForm\" (ngSubmit)=\"onEmployeeUpdate(f)\">\n        <h2 class=\"prim text-al--left\">PERSONAL INFORMATION</h2>\n        <h4 class=\"dark text-al--left\">Name<br>  \n          <input type=\"text\" class=\"form-control\" id=\"InputempName\" name=\"account.empName\" [(ngModel)]=\"account.empName\" required placeholder=\"Enter Full Name\" [ngStyle]=\"myStyle1\" (change)=\"myStyle1={border:checkInput(account.empName.value)}; edited=true\">\n        </h4>\n      <h4 class=\"dark text-al--left\">Email<br> <input type=\"email\" class=\"form-control\" id=\"InputempEmail\" aria-describedby=\"emailHelp\" placeholder=\"Enter Email\" name=\"account.empEmail\"  required [(ngModel)]=\"account.empEmail\" [ngStyle]=\"myStyle3\" (change)=\"myStyle3={border:checkEmail(account.empEmail.value)};  edited=true\">\n      </h4>\n      \n      \n      \n      \n      <h4 class=\"dark text-al--left\">Position<br><input type=\"text\" class=\"form-control\" id=\"inputempPosition\" placeholder=\"Enter Position\" name=\"account.empPosition\" required [(ngModel)]=\"account.empPosition\" [ngStyle]=\"myStyle6\" (change)=\"myStyle6={border:checkInput(account.empPosition.value)};  edited=true\"></h4>\n      \n       <h4 class=\"dark text-al--left\">Phone Number<br><input type=\"text\" class=\"form-control\" id=\"Inputempphone\" placeholder=\"phone\" name=\"account.empPhone\"  required [(ngModel)]=\"account.empPhone\" [ngStyle]=\"myStyle8\" (change)=\"myStyle8={border:checkInput(account.empPhone.value)};  edited=true\"></h4>\n      \n       <h4 class=\"dark text-al--left\">Wage per Hour<Br>\n        <input type=\"number\" class=\"form-control\" id=\"inputempHrRate\" placeholder=\"Enter Hourly Rate\" name=\"account.empHrRate\"  required   [(ngModel)]=\"account.empHrRate\"  [ngStyle]=\"myStyle7\" (change)=\"myStyle7={border:checkInput(account.empHrRate.value)};  edited=true\">\n       </h4>\n      \n       <h4 class=\"dark text-al--left\">Date of Birth<Br>\n        <input type=\"text\" class=\"form-control\" id=\"Inputempdob\" placeholder=\"Date of Birth\" name=\"account.empDob\"  [(ngModel)]=\"account.empDob\"  required [ngStyle]=\"myStyle5\" (change)=\"myStyle5={border:checkDOB(account.empDob.value)}; edited=true \">\n       </h4>\n       <button class=\"col-sm-4 btn btn-primary\" type=\"submit\" [disabled]=\"!edited\">Update Profile</button>\n      </form>\n    </div>\n  </div>\n  "

/***/ }),

/***/ "./src/app/components/view-company-profile/select-employee/select-employee.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SelectEmployeeComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var SelectEmployeeComponent = /** @class */ (function () {
    function SelectEmployeeComponent(validateService, flashMessages, authService, route, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.route = route;
        this.router = router;
        this.editMode = false;
        this.edited = false;
        this.updateFlag = false;
    }
    SelectEmployeeComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.authService.getCompany().subscribe(function (profile) {
            for (var i = 0; i < profile.company.employees.length; i++) {
                if (_this.route.snapshot.params['id'] === profile.company.employees[i]._id)
                    _this.account = profile.company.employees[i];
            }
            _this.compId = profile.company._id;
            console.log(_this.account);
        }, function (err) {
            console.log(err);
            return false;
        });
    };
    SelectEmployeeComponent.prototype.EditUser = function () {
        this.editMode = !this.editMode;
        console.log(this.editMode);
    };
    SelectEmployeeComponent.prototype.onEmployeeUpdate = function (i) {
        var _this = this;
        var update = {
            compId: this.compId,
            emp: this.account
        };
        this.authService.updateEmployee(update).subscribe(function (data) {
            _this.flashMessages.show('Your employee is now updated! ', { cssClass: 'alert-success', timeout: 3000 });
            _this.ngOnInit();
            _this.editMode = false;
        }, function (err) {
            console.log(err);
            _this.flashMessages.show('Your employee was not updated! ', { cssClass: 'alert-danger', timeout: 3000 });
            return false;
        });
    };
    SelectEmployeeComponent.prototype.checkPass = function (f) {
        if (!this.validateService.ValidatePassword(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    SelectEmployeeComponent.prototype.checkEmail = function (f) {
        if (!this.validateService.ValidateEmail(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    SelectEmployeeComponent.prototype.checkInput = function (f) {
        if (!this.validateService.ValidateInput(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    SelectEmployeeComponent.prototype.checkDOB = function (f) {
        if (this.validateService.dobFormat(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    SelectEmployeeComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-select-employee',
            template: __webpack_require__("./src/app/components/view-company-profile/select-employee/select-employee.component.html"),
            providers: [__WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */]],
            styles: [__webpack_require__("./src/app/components/view-company-profile/select-employee/select-employee.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["a" /* ActivatedRoute */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]])
    ], SelectEmployeeComponent);
    return SelectEmployeeComponent;
}());



/***/ }),

/***/ "./src/app/components/view-company-profile/view-company-profile.component.css":
/***/ (function(module, exports) {

module.exports = "\r\n.addEmployeeForm{\r\n    font: 95% Arial, Helvetica, sans-serif;\r\n    width: 500px;\r\n    margin: 10px auto;\r\n    padding: 16px;\r\n    background: #F7F7F7;\r\n    position:fixed;\r\n    float: left;\r\n    top: 50%;\r\n    left: 50%;\r\n    -webkit-transform:  translate(-50%, -50%); /* Safari */\r\n    transform: translate(-50%, -50%);\r\n    -ms-transform:translate(-50%, -50%);\r\n    opacity:0;\r\n    -webkit-box-shadow: 5px 5px 18px #888888;\r\n            box-shadow: 5px 5px 18px #888888;\r\n    display:none;\r\n}\r\n.addEmployeeForm h1{\r\n    background: #72002f;\r\n    padding: 20px 0;\r\n    font-size: 140%;\r\n    font-weight: 300;\r\n    text-align: center;\r\n    color: #fff;\r\n    margin: -16px -16px 16px -16px;\r\n}\r\n.addEmployeeForm h1 i{\r\n    \r\n    position:absolute;\r\n    top:20px;\r\n    right:20px;\r\n\r\n}\r\n.addEmployeeForm input[type=\"text\"],\r\n.addEmployeeForm input[type=\"date\"],\r\n.addEmployeeForm input[type=\"datetime\"],\r\n.addEmployeeForm input[type=\"password\"],\r\n.addEmployeeForm input[type=\"email\"],\r\n.addEmployeeForm input[type=\"number\"],\r\n.addEmployeeForm input[type=\"search\"],\r\n.addEmployeeForm input[type=\"time\"],\r\n.addEmployeeForm input[type=\"url\"],\r\n.addEmployeeForm textarea,\r\n.addEmployeeForm select \r\n{\r\n    -webkit-transition: all 0.30s ease-in-out;\r\n    -moz-transition: all 0.30s ease-in-out;\r\n    -ms-transition: all 0.30s ease-in-out;\r\n    -o-transition: all 0.30s ease-in-out;\r\n    outline: none;\r\n    box-sizing: border-box;\r\n    -webkit-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    width: 100%;\r\n    background: #fff;\r\n    margin-bottom: 4%;\r\n    border: 1px solid #ccc;\r\n    padding: 3%;\r\n    color: #555;\r\n    font: 95% Arial, Helvetica, sans-serif;\r\n}\r\n.addEmployeeForm input[type=\"password\"]:focus,\r\n.addEmployeeForm input[type=\"text\"]:focus,\r\n.addEmployeeForm input[type=\"date\"]:focus,\r\n.addEmployeeForm input[type=\"datetime\"]:focus,\r\n.addEmployeeForm input[type=\"email\"]:focus,\r\n.addEmployeeForm input[type=\"number\"]:focus,\r\n.addEmployeeForm input[type=\"search\"]:focus,\r\n.addEmployeeForm input[type=\"time\"]:focus,\r\n.addEmployeeForm input[type=\"url\"]:focus,\r\n.addEmployeeForm textarea:focus,\r\n.addEmployeeForm select:focus\r\n{\r\n    -webkit-box-shadow: 0 0 5px #72002f;\r\n            box-shadow: 0 0 5px #72002f;\r\n    padding: 3%;\r\n    border: 1px solid #72002f;\r\n}\r\n.addEmployeeForm input[type=\"submit\"],\r\n.addEmployeeForm input[type=\"button\"]{\r\n    box-sizing: border-box;\r\n    -webkit-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    width: 100%;\r\n    padding: 3%;\r\n    background: #72002f;\r\n    border-bottom: 2px solid #72002f;\r\n    border-top-style: none;\r\n    border-right-style: none;\r\n    border-left-style: none;    \r\n    color: #fff;\r\n}\r\n.addEmployeeForm input[type=\"submit\"]:hover,\r\n.addEmployeeForm input[type=\"button\"]:hover{\r\n    background: #72002f;\r\n}\r\n"

/***/ }),

/***/ "./src/app/components/view-company-profile/view-company-profile.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"col-sm-12 viewprofile\">\n  <div class=\"col-sm-3 \" *ngIf=\"account\">\n      <img class=\"img-responsive img-circle addMargin\" src=\"../../../../assets/images/defaultprofile.jpeg\" alt=\"\"> \n      <h2 class=\"dark text-al--center\" *ngIf=\"account.title\">{{account.title}}<br> <small>{{account.email}}</small></h2>\n\n  \n  </div>\n  <div class=\" col-sm-8 right\">\n    \n      \n      <h2 class=\"prim text-al--left\">INFORMATION</h2>\n      <h4 class=\"dark text-al--left\" *ngIf=\"account.name\">Username<br><small>{{account.name}}</small></h4>\n      \n      \n       <h4 class=\"dark text-al--left\" *ngIf=\"account.phone\">Phone Number<br><small> {{account.phone}}</small></h4>\n      \n      \n       <h4 class=\"dark text-al--left\" *ngIf=\"account.companyRegNum\">Company Registration Number<Br><small> {{account.companyRegNum}}</small></h4>\n        <h4 class=\"dark text-al--left\" *ngIf=\"account.town\">Address<Br><small> {{account.street}},<br>{{account.town}},<br>{{account.county}},<br>{{account.country}},<br></small></h4>\n  </div>\n</div>\n"

/***/ }),

/***/ "./src/app/components/view-company-profile/view-company-profile.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ViewCompanyProfileComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__ = __webpack_require__("./node_modules/@ng-bootstrap/ng-bootstrap/index.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var ViewCompanyProfileComponent = /** @class */ (function () {
    function ViewCompanyProfileComponent(validateService, flashMessages, authService, router, modalService, zone) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.modalService = modalService;
        this.zone = zone;
        this.isLoggedin = false;
    }
    ViewCompanyProfileComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (localStorage.getItem('isCompany') == 'true') {
            this.authService.getCompany().subscribe(function (profile) {
                _this.account = profile.company;
                console.log(_this.account);
            }, function (err) {
                console.log(err);
                return false;
            });
        }
        else {
            this.authService.getProfile().subscribe(function (profile) {
                _this.account = profile.employee;
                console.log("it has made it into auth.getprofile subscription" + JSON.stringify(profile));
            }, function (err) {
                console.log(err);
                return false;
            });
        }
    };
    ViewCompanyProfileComponent.prototype.toggleNewEmployeeModal = function () {
        if (document.getElementById("addEmployeeForm").style.opacity == "1") {
            document.getElementById("addEmployeeForm").style.opacity = "0";
            document.getElementById("addEmployeeForm").style.display = "none";
        }
        else {
            document.getElementById("addEmployeeForm").style.display = "block";
            document.getElementById("addEmployeeForm").style.opacity = "1";
        }
    };
    ViewCompanyProfileComponent.prototype.onEmployeeSubmit = function (f) {
        var _this = this;
        console.log(f);
        var employee = {
            details: this.account,
            empName: f.form.value.fullname,
            empEmail: f.form.value.ememail,
            empUsername: f.form.value.username,
            empPosition: f.form.value.emposition,
            empHrRate: f.form.value.empHrRate,
            empDob: f.form.value.dob,
            empPhone: f.form.value.empPhone,
            empPassword: f.form.value.empPassword,
        };
        console.log(employee);
        //employee is unchecked/false
        //company is checked/true
        this.authService.registerEmployee(employee).subscribe(function (data) {
            if (data.success) {
                _this.flashMessages.show('New Employee Added', { cssClass: 'success-danger', timeout: 3000 });
                _this.ngOnInit();
                //this.router.navigate(['view-company-profile']);
            }
            else {
                _this.flashMessages.show(data.msg, { cssClass: 'alert-danger', timeout: 3000 });
                // this.router.navigate(['']);
            }
        });
    };
    ViewCompanyProfileComponent.prototype.selectEmployee = function (i) {
        console.log(i);
        localStorage.setItem('id', i);
        this.router.navigate(['select-employee']);
    };
    ViewCompanyProfileComponent.prototype.isLoggedIn = function () {
        if (localStorage.getItem("id_token") == null) {
            this.isLoggedin = false;
            return this.isLoggedin;
        }
        else {
            return true;
        }
    };
    ViewCompanyProfileComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-view-company-profile',
            template: __webpack_require__("./src/app/components/view-company-profile/view-company-profile.component.html"),
            styles: [__webpack_require__("./src/app/components/view-company-profile/view-company-profile.component.css")]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */],
            __WEBPACK_IMPORTED_MODULE_5__ng_bootstrap_ng_bootstrap__["b" /* NgbModal */],
            __WEBPACK_IMPORTED_MODULE_0__angular_core__["NgZone"]])
    ], ViewCompanyProfileComponent);
    return ViewCompanyProfileComponent;
}());



/***/ }),

/***/ "./src/app/components/view-employee-profile/view-employee-profile.component.css":
/***/ (function(module, exports) {

module.exports = ".example-icon {\r\n    padding: 0 14px;\r\n  }\r\n  \r\n  .example-spacer {\r\n    -webkit-box-flex: 1;\r\n        -ms-flex: 1 1 auto;\r\n            flex: 1 1 auto;\r\n  }"

/***/ }),

/***/ "./src/app/components/view-employee-profile/view-employee-profile.component.html":
/***/ (function(module, exports) {

module.exports = "\n<div class=\"row\">\n    <div class=\"col-lg-12\" *ngIf=\"account\">\n      <h1 class=\"page-header\" >\n                        {{account.empName}} <small *ngIf=\"account\">Profile View</small>\n                    </h1>\n      <ol class=\"breadcrumb\">\n        <li >\n          <i class=\"fa fa-dashboard\"></i> Dashboard\n        </li>\n        <li >\n            <i class=\"fa fa-dashboard\"></i> Profile\n          </li>\n          <li >\n              <i class=\"fa fa-dashboard\"></i>{{account.empName}}\n            </li>\n      </ol>\n    </div>\n  </div>\n<div class=\"col-sm-12 viewprofile\">\n\n  <div class=\"col-sm-3\">\n      <img class=\"img-responsive img-circle addMargin\" src=\"../../../../assets/images/defaultprofile.jpeg\" alt=\"\"> \n        <button class=\"btn btn-primary col-sm-12\" (click)=\"EditUser()\"><i [ngClass]=\"editMode ? 'glyphicon glyphicon-minus' : 'glyphicon glyphicon-plus'\" ></i>Edit Mode </button>\n  </div>\n  <div class=\"col-sm-9 \" *ngIf=\"account && !editMode\">\n     \n      <div class=\"col-sm-12 \">\n        <h2 class=\"prim text-al--left\">PERSONAL INFORMATION</h2>\n      <h4 class=\"dark text-al--left\">Email<br> <small>{{account.empEmail}}</small></h4>\n      \n      \n      <h4 class=\"dark text-al--left\">Username<br><small>{{account.empUsername}}</small></h4>\n      \n      <h4 class=\"dark text-al--left\">Position<br><small>\n        {{account.empPosition}}\n      </small></h4>\n      \n       <h4 class=\"dark text-al--left\">Phone Number<br><small> {{account.empPhone}}</small></h4>\n       <h4 class=\"dark text-al--left\">Wage per Hour<br><small> €{{account.empHrRate}}</small></h4>\n      \n       <h4 class=\"dark text-al--left\">Date of Birth<Br><small> {{account.empDob}}</small></h4>\n      </div>\n  </div>\n  <div class=\"col-sm-9 \" *ngIf=\"account && editMode\">\n     \n      <div class=\"col-sm-12 \">\n        <form #f=\"ngForm\" (ngSubmit)=\"onEmployeeUpdate(f)\">\n        <h2 class=\"prim text-al--left\">PERSONAL INFORMATION</h2>\n        <h4 class=\"dark text-al--left\">Name<br>  \n          <input type=\"text\" class=\"form-control\" id=\"InputempName\" name=\"account.empName\" [(ngModel)]=\"account.empName\" required placeholder=\"Enter Full Name\" [ngStyle]=\"myStyle21\" (change)=\" myStyle21={border:checkInput(account.empName)}; edited=true\">\n        </h4>\n      <h4 class=\"dark text-al--left\">Email<br> <input type=\"email\" class=\"form-control\" id=\"InputempEmail\" aria-describedby=\"emailHelp\" placeholder=\"Enter Email\" name=\"account.empEmail\"  required [(ngModel)]=\"account.empEmail\" [ngStyle]=\"myStyle23\" (change)=\"myStyle23={border:checkEmail(account.empEmail)}; edited=true\">\n      </h4>\n      \n      \n      \n      \n      <h4 class=\"dark text-al--left\">Position<br><input type=\"text\" class=\"form-control\" id=\"inputempPosition\" placeholder=\"Enter Position\" name=\"account.empPosition\" required [(ngModel)]=\"account.empPosition\" [ngStyle]=\"myStyle26\" (change)=\"myStyle26={border:checkInput(account.empPosition)}; edited=true\"></h4>\n      \n       <h4 class=\"dark text-al--left\">Phone Number<br><input type=\"text\" class=\"form-control\" id=\"Inputempphone\" placeholder=\"phone\" name=\"account.empPhone\"  required [(ngModel)]=\"account.empPhone\" [ngStyle]=\"myStyle28\" (change)=\"myStyle28={border:checkInput(account.empPhone)}; edited=true\"></h4>\n      \n       <h4 class=\"dark text-al--left\">Wage per Hour<Br>\n        <input type=\"number\" class=\"form-control\" id=\"inputempHrRate\" placeholder=\"Enter Hourly Rate\" name=\"account.empHrRate\"  required   [(ngModel)]=\"account.empHrRate\"  [ngStyle]=\"myStyle27\" (change)=\"myStyle27={border:checkInput(account.empHrRate)}; edited=true\">\n       </h4>\n      \n       <h4 class=\"dark text-al--left\">Date of Birth<Br>\n        <input type=\"text\" class=\"form-control\" id=\"Inputempdob\" placeholder=\"Date of Birth\" name=\"account.empDob\"  [(ngModel)]=\"account.empDob\"  required [ngStyle]=\"myStyle25\" (change)=\"myStyle25={border:checkDOB(account.empDob)}; edited=true \">\n       </h4>\n       <button class=\"col-sm-4 btn btn-primary\" type=\"submit\" [disabled]=\"!edited\">Update Profile</button>\n      </form>\n    </div>\n  </div>\n  "

/***/ }),

/***/ "./src/app/components/view-employee-profile/view-employee-profile.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ViewEmployeeProfileComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_validate_service__ = __webpack_require__("./src/app/services/validate.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__ = __webpack_require__("./node_modules/angular2-flash-messages/module/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var ViewEmployeeProfileComponent = /** @class */ (function () {
    function ViewEmployeeProfileComponent(validateService, flashMessages, authService, router) {
        this.validateService = validateService;
        this.flashMessages = flashMessages;
        this.authService = authService;
        this.router = router;
        this.editMode = false;
        this.edited = false;
        this.updateFlag = false;
    }
    ViewEmployeeProfileComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.authService.getProfile().subscribe(function (profile) {
            _this.account = profile.employee;
            console.log(_this.account);
        }, function (err) {
            console.log(err);
            return false;
        });
    };
    ViewEmployeeProfileComponent.prototype.EditUser = function () {
        this.editMode = !this.editMode;
        console.log(this.editMode);
    };
    ViewEmployeeProfileComponent.prototype.onEmployeeUpdate = function (i) {
        var _this = this;
        var error_flag = false;
        var update = {
            compId: this.account.compId,
            emp: this.account
        };
        if (!this.validateService.ValidateEmployee(update.emp)) {
            console.log('Please fill in all fields');
            this.flashMessages.show('Please fill in all the fields', { cssClass: 'alert-danger', timeout: 3000 });
            error_flag = true;
        }
        if (!this.validateService.ValidateEmail(update.emp.empEmail)) {
            console.log('Please fill in valid Email Address');
            this.flashMessages.show('Please enter valid Email Address', { cssClass: 'alert-danger', timeout: 3000 });
            error_flag = true;
        }
        if (!this.validateService.dobFormat(update.emp.empDob)) {
            console.log('Please correctly input you Date of birth');
            this.flashMessages.show('Please enter valid Email Address', { cssClass: 'alert-danger', timeout: 3000 });
            error_flag = true;
        }
        if (!this.validateService.ValidatePassword(update.emp.empPassword)) {
            console.log('Please use a valid Password');
            this.flashMessages.show('Please use a valid Password - Mixed use of UPPER CASE, LOWER CASE & NUMBERS', { cssClass: 'alert-danger', timeout: 3000 });
            error_flag = true;
        }
        if (error_flag == false) {
            console.log();
            this.authService.updateEmployee(update).subscribe(function (data) {
                _this.flashMessages.show('Your employee is now updated! ', { cssClass: 'alert-success', timeout: 3000 });
                _this.ngOnInit();
                _this.editMode = false;
            }, function (err) {
                console.log(err);
                _this.flashMessages.show('Your employee was not updated! ', { cssClass: 'alert-danger', timeout: 3000 });
                return false;
            });
        }
    };
    ViewEmployeeProfileComponent.prototype.checkPass = function (f) {
        if (!this.validateService.ValidatePassword(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    ViewEmployeeProfileComponent.prototype.checkEmail = function (f) {
        console.log(f);
        if (!this.validateService.ValidateEmail(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    ViewEmployeeProfileComponent.prototype.checkInput = function (f) {
        if (!this.validateService.ValidateInput(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    ViewEmployeeProfileComponent.prototype.checkDOB = function (f) {
        console.log(f);
        if (!this.validateService.dobFormat(f)) {
            return '2px solid red';
        }
        else {
            return '2px solid green';
        }
    };
    ViewEmployeeProfileComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-view-employee-profile',
            template: __webpack_require__("./src/app/components/view-employee-profile/view-employee-profile.component.html"),
            providers: [__WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */]],
            styles: [__webpack_require__("./src/app/components/view-employee-profile/view-employee-profile.component.css")],
        }),
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Directive"])({
            selector: '[TAB_COMPONENTS]'
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__services_validate_service__["a" /* ValidateService */],
            __WEBPACK_IMPORTED_MODULE_3_angular2_flash_messages__["FlashMessagesService"],
            __WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]])
    ], ViewEmployeeProfileComponent);
    return ViewEmployeeProfileComponent;
}());



/***/ }),

/***/ "./src/app/guards/auth.guard.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthGuard; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("./node_modules/@angular/router/esm5/router.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_auth_service__ = __webpack_require__("./src/app/services/auth.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AuthGuard = /** @class */ (function () {
    function AuthGuard(authService, router) {
        this.router = router;
    }
    AuthGuard.prototype.canActivate = function () {
        if (localStorage.getItem("id_token") == null) {
            this.router.navigate(['/login']);
            return false;
        }
        else
            return true;
    };
    AuthGuard = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__services_auth_service__["a" /* AuthService */],
            __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]])
    ], AuthGuard);
    return AuthGuard;
}());



/***/ }),

/***/ "./src/app/material.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MaterialModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("./node_modules/@angular/material/esm5/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

// import {MatButtonModule, MatToolbarModule} from '@angular/material';

var MaterialModule = /** @class */ (function () {
    function MaterialModule() {
    }
    MaterialModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["NgModule"])({
            imports: [__WEBPACK_IMPORTED_MODULE_1__angular_material__["b" /* MatAutocompleteModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["c" /* MatButtonModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["d" /* MatButtonToggleModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["e" /* MatCardModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["f" /* MatCheckboxModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["g" /* MatChipsModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["h" /* MatDatepickerModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["j" /* MatDialogModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["k" /* MatDividerModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["l" /* MatExpansionModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["m" /* MatGridListModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["n" /* MatIconModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["o" /* MatInputModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["p" /* MatListModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["q" /* MatMenuModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["r" /* MatNativeDateModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["s" /* MatPaginatorModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["t" /* MatProgressBarModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["u" /* MatProgressSpinnerModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["v" /* MatRadioModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["w" /* MatRippleModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["x" /* MatSelectModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["y" /* MatSidenavModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["A" /* MatSliderModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["z" /* MatSlideToggleModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["B" /* MatSnackBarModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["C" /* MatSortModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["D" /* MatStepperModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["E" /* MatTableModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["F" /* MatTabsModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["G" /* MatToolbarModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["H" /* MatTooltipModule */],],
            exports: [__WEBPACK_IMPORTED_MODULE_1__angular_material__["b" /* MatAutocompleteModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["c" /* MatButtonModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["d" /* MatButtonToggleModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["e" /* MatCardModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["f" /* MatCheckboxModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["g" /* MatChipsModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["h" /* MatDatepickerModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["j" /* MatDialogModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["k" /* MatDividerModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["l" /* MatExpansionModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["m" /* MatGridListModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["n" /* MatIconModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["o" /* MatInputModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["p" /* MatListModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["q" /* MatMenuModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["r" /* MatNativeDateModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["s" /* MatPaginatorModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["t" /* MatProgressBarModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["u" /* MatProgressSpinnerModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["v" /* MatRadioModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["w" /* MatRippleModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["x" /* MatSelectModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["y" /* MatSidenavModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["A" /* MatSliderModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["z" /* MatSlideToggleModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["B" /* MatSnackBarModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["C" /* MatSortModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["D" /* MatStepperModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["E" /* MatTableModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["F" /* MatTabsModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["G" /* MatToolbarModule */],
                __WEBPACK_IMPORTED_MODULE_1__angular_material__["H" /* MatTooltipModule */],]
        })
    ], MaterialModule);
    return MaterialModule;
}());



/***/ }),

/***/ "./src/app/pipes/client.pipe.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ClientPipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var ClientPipe = /** @class */ (function () {
    function ClientPipe() {
    }
    ClientPipe.prototype.transform = function (items, clientText) {
        if (!items)
            return [];
        if (!clientText)
            return items;
        clientText = clientText.toLowerCase();
        return items.filter(function (it) {
            return it.Name.toLowerCase().includes(clientText);
        });
    };
    ClientPipe = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'client'
        })
    ], ClientPipe);
    return ClientPipe;
}());



/***/ }),

/***/ "./src/app/pipes/employee.pipe.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return EmployeePipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var EmployeePipe = /** @class */ (function () {
    function EmployeePipe() {
    }
    EmployeePipe.prototype.transform = function (items, searchText) {
        if (!items)
            return [];
        if (!searchText)
            return items;
        searchText = searchText.toLowerCase();
        return items.filter(function (it) {
            return it.empName.toLowerCase().includes(searchText);
        });
    };
    EmployeePipe = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'employee'
        })
    ], EmployeePipe);
    return EmployeePipe;
}());



/***/ }),

/***/ "./src/app/pipes/order-by.pipe.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return OrderByPipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var OrderByPipe = /** @class */ (function () {
    function OrderByPipe() {
    }
    OrderByPipe.prototype.transform = function (array, args) {
        if (array != undefined) {
            array.sort(function (a, b) {
                if (a[args] < b[args]) {
                    return -1;
                }
                else if (a[args] > b[args]) {
                    return 1;
                }
                else {
                    return 0;
                }
            });
        }
        return array;
    };
    OrderByPipe = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'orderBy'
        })
    ], OrderByPipe);
    return OrderByPipe;
}());



/***/ }),

/***/ "./src/app/pipes/search-pipe.pipe.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SearchPipePipe; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var SearchPipePipe = /** @class */ (function () {
    function SearchPipePipe() {
    }
    SearchPipePipe.prototype.transform = function (items, searchText) {
        if (!items)
            return [];
        if (!searchText)
            return items;
        searchText = searchText.toLowerCase();
        return items.filter(function (it) {
            return it.title.toLowerCase().includes(searchText);
        });
    };
    SearchPipePipe = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'search'
        })
    ], SearchPipePipe);
    return SearchPipePipe;
}());



/***/ }),

/***/ "./src/app/services/auth.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("./node_modules/@angular/http/esm5/http.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__ = __webpack_require__("./node_modules/rxjs/_esm5/add/operator/map.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AuthService = /** @class */ (function () {
    function AuthService(http) {
        this.http = http;
        this.isLoggedin = false;
    }
    //checking is anyone logged in.
    AuthService.prototype.isLoggedIn = function () {
        if (localStorage.getItem("id_token") == null) {
            this.isLoggedin = false;
            console.log(this.isLoggedIn);
            return this.isLoggedin;
        }
        else {
            console.log(this.isLoggedIn);
            return true;
        }
    };
    //log out
    AuthService.prototype.logout = function () {
        this.authToken = null;
        this.employee = null;
        this.company = null;
        localStorage.clear();
    };
    //return JWT auth token
    AuthService.prototype.loadToken = function () {
        var token = localStorage.getItem('id_token');
        this.authToken = token;
    };
    //Employee Auth Services
    AuthService.prototype.registerEmployee = function (employee) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/employees/register', employee, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getUserProfile = function () {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        this.loadToken();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/employees/profile', { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getProfile = function () {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        this.loadToken();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/employees/profile', { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.updateEmployee = function (employee) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(employee);
        headers.append('Content-Type', 'application/json');
        return this.http.put('http://localhost:3000/employees/update', employee, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.authenticateEmployee = function (employee) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/employees/authenticate', employee, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.storeEmployeeData = function (token, employee) {
        localStorage.setItem('id_token', token);
        localStorage.setItem('employee', JSON.stringify(employee));
        this.authToken = token;
        this.employee = employee;
    };
    //Company Auth Services
    AuthService.prototype.authenticateCompany = function (company) {
        console.log(company);
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/companies/authenticate', company, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.registerCompany = function (company) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/companies/register', company, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getCompany = function () {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        this.loadToken();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/companies/profile', { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getCompanybyEmpId = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('name', ts);
        this.loadToken();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/companies/getCompanyEmpsbyId', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getAllEmployees = function (compName) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('name', compName);
        this.loadToken();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/companies/searchCompanies', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.removeEmp = function (id, id2) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', id + "///" + id2);
        console.log(id);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.delete('http://localhost:3000/employees/removeEmp', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.storeData = function (token, data) {
        console.log(data);
        localStorage.setItem('id_token', token);
        localStorage.setItem('isCompany', data);
        this.authToken = token;
        // this.company = company;
    };
    /*/////////////////////////////////////
                  Timesheets
    ////////////////////////////////////*/
    AuthService.prototype.getEmployeeTimesheets = function (empId) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', empId);
        this.loadToken();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        if (localStorage.getItem('isCompany') == 'true') {
            return this.http.get('http://localhost:3000/timesheets/getEmployeeTimesheetsforComp', { headers: headers, search: search })
                .map(function (res) { return res.json(); });
        }
        else {
            return this.http.get('http://localhost:3000/timesheets/getEmployeeTimesheets', { headers: headers, search: search })
                .map(function (res) { return res.json(); });
        }
    };
    AuthService.prototype.getBudgetTimesheets = function (id) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', id);
        this.loadToken();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/timesheets/getProjectBudgetfromTS', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.registerTimesheets = function (timesheet) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/timesheets/register', timesheet, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.updateTimesheet = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Content-Type', 'application/json');
        return this.http.put('http://localhost:3000/timesheets/update', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.removeTimesheet = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts._id);
        console.log(ts);
        headers.append('Content-Type', 'application/json');
        return this.http.delete('http://localhost:3000/timesheets/remove', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    /*/////////////////////////////////////
              Calendar & Events
    ////////////////////////////////////*/
    AuthService.prototype.getEvents = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts._id);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/calendars/getEvents', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.addEvents = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/calendars/addEvent', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.removeEvents = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts._id);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.delete('http://localhost:3000/calendars/removeEvent', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.updateEvent = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Content-Type', 'application/json');
        return this.http.put('http://localhost:3000/calendars/updateEvent', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    /*/////////////////////////////////////
               Stage
     ////////////////////////////////////*/
    AuthService.prototype.getStages = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/stages/getStages', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.addServices = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/stages/addStage', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.removeServices = function (id) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', id);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.delete('http://localhost:3000/stages/removeStage', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.updateServices = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Content-Type', 'application/json');
        return this.http.put('http://localhost:3000/calendars/updateEvent', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    /*/////////////////////////////////////
              Clients
    ////////////////////////////////////*/
    AuthService.prototype.getOneClient = function (id) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', id);
        this.loadToken();
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/clients/getClientOne', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getClients = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/clients/getClients', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getClientbyId = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/clients/getClientbyId', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.addClient = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/clients/addClient', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.removeClient = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.delete('http://localhost:3000/clients/removeClient', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.updateClient = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Content-Type', 'application/json');
        return this.http.put('http://localhost:3000/clients/updateClient', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    /*/////////////////////////////////////
                Projects
      ////////////////////////////////////*/
    AuthService.prototype.getProjectbyId = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/projects/getProjectsbyId', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getProjectbyComp = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/projects/getProjectsbyComp', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.updateStageBudget = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        headers.append('Content-Type', 'application/json');
        return this.http.put('http://localhost:3000/projects/updateBudget', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getProjectbyUser = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/projects/getProjectsbyUser', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.getProjectsbyClient = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.get('http://localhost:3000/projects/getProjectsbyClient', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.addProject = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.post('http://localhost:3000/projects/addProject', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.removeProject = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        var search = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* URLSearchParams */]();
        search.set('id', ts);
        console.log(ts);
        headers.append('Authorization', this.authToken);
        headers.append('Content-Type', 'application/json');
        return this.http.delete('http://localhost:3000/projects/removeProject', { headers: headers, search: search })
            .map(function (res) { return res.json(); });
    };
    AuthService.prototype.updateProject = function (ts) {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        console.log(ts);
        headers.append('Content-Type', 'application/json');
        return this.http.put('http://localhost:3000/projects/updateProject', ts, { headers: headers })
            .map(function (res) { return res.json(); });
    };
    AuthService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */]])
    ], AuthService);
    return AuthService;
}());



/***/ }),

/***/ "./src/app/services/validate.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ValidateService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ValidateService = /** @class */ (function () {
    function ValidateService() {
    }
    ValidateService.prototype.ValidateEmployeeRegister = function (user) {
        if (user.website == undefined || user.companyRegNum == undefined || user.name == undefined || user.fullname == undefined || user.password == undefined || user.username == undefined || user.dob == undefined || user.addressline == undefined || user.town == undefined || user.county == undefined || user.country == undefined) {
            return false;
        }
        else {
            return true;
        }
    };
    ValidateService.prototype.ValidateCompRegister = function (user) {
        if (user.website == undefined || user.companyRegNum == undefined || user.name == undefined || user.street == undefined || user.town == undefined || user.county == undefined || user.country == undefined || user.title == undefined || user.email == undefined || user.phone == undefined || user.password == undefined) {
            return false;
        }
        else {
            return true;
        }
    };
    ValidateService.prototype.ValidateProjectRegister = function (user) {
        if (user.createdBy == undefined || user.createDate == undefined || user.title == undefined || user.clientId == undefined || user.companyId == undefined || user.SiteAddress == undefined || user.projectProgress == undefined || user.projectComplete == undefined) {
            return false;
        }
        else {
            return true;
        }
    };
    ValidateService.prototype.ValidateClientRegister = function (user) {
        if (user.Email == undefined || user.OfficeTel == undefined || user.MobileTel == undefined || user.Address == undefined || user.Name == undefined) {
            return false;
        }
        else {
            return true;
        }
    };
    ValidateService.prototype.ValidateEmployee = function (user) {
        if (user.empName == undefined || user.empEmail == undefined || user.empUsername == undefined || user.empPosition == undefined || user.empDob == undefined || user.empPhone == undefined || user.empHrRate == undefined || user.empPassword == undefined || user.empName == "" || user.empEmail == "" || user.empUsername == "" || user.empPosition == "" || user.empDob == "" || user.empPhone == "" || user.empHrRate == "" || user.empPassword == "") {
            return false;
        }
        else {
            return true;
        }
    };
    ValidateService.prototype.ValidateInput = function (f) {
        if (f == undefined || f == "" || f == null || f == 0)
            return false;
        else
            return true;
    };
    ValidateService.prototype.ValidatePassword = function (password) {
        var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        return mediumRegex.test(password) && password.length >= 8;
    };
    ValidateService.prototype.twoInputsSame = function (s1, s2) {
        if (s1 === s2) {
            return true;
        }
        else {
            return false;
        }
    };
    ValidateService.prototype.ValidateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toString().toLowerCase());
    };
    ValidateService.prototype.NoSpecialCharacters = function (input) {
        var re = /^[_A-z0-9]*((-|\s)*[_A-z0-9])*$/;
        return re.test(input.toLowerCase());
    };
    ValidateService.prototype.dobFormat = function (dob) {
        var re = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
        return re.test(dob);
    };
    ValidateService.prototype.ObjIdtoDate = function (object) {
        var timestamp = object.toString().substring(0, 8);
        return new Date(parseInt(timestamp, 16) * 1000);
    };
    ValidateService.prototype.isSameDay = function (d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    };
    ValidateService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
        __metadata("design:paramtypes", [])
    ], ValidateService);
    return ValidateService;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false
};


/***/ }),

/***/ "./src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("./node_modules/@angular/core/esm5/core.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("./node_modules/@angular/platform-browser-dynamic/esm5/platform-browser-dynamic.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("./src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("./src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["enableProdMode"])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ "./src/polyfills.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_core_js_es7_reflect__ = __webpack_require__("./node_modules/core-js/es7/reflect.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_core_js_es7_reflect___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_core_js_es7_reflect__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_zone_js_dist_zone__ = __webpack_require__("./node_modules/zone.js/dist/zone.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_zone_js_dist_zone___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_zone_js_dist_zone__);
/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/docs/ts/latest/guide/browser-support.html
 */
/***************************************************************************************************
 * BROWSER POLYFILLS
 */
/** IE9, IE10 and IE11 requires all of the following polyfills. **/
// import 'core-js/es6/symbol';
// import 'core-js/es6/object';
// import 'core-js/es6/function';
// import 'core-js/es6/parse-int';
// import 'core-js/es6/parse-float';
// import 'core-js/es6/number';
// import 'core-js/es6/math';
// import 'core-js/es6/string';
// import 'core-js/es6/date';
// import 'core-js/es6/array';
// import 'core-js/es6/regexp';
// import 'core-js/es6/map';
// import 'core-js/es6/weak-map';
// import 'core-js/es6/set';
/** IE10 and IE11 requires the following for NgClass support on SVG elements */
// import 'classlist.js';  // Run `npm install --save classlist.js`.
/** IE10 and IE11 requires the following for the Reflect API. */
// import 'core-js/es6/reflect';
/** Evergreen browsers require these. **/
// Used for reflect-metadata in JIT. If you use AOT (and only Angular decorators), you can remove.

/**
 * Required to support Web Animations `@angular/platform-browser/animations`.
 * Needed for: All but Chrome, Firefox and Opera. http://caniuse.com/#feat=web-animation
 **/
// import 'web-animations-js';  // Run `npm install --save web-animations-js`.
/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
 // Included with Angular CLI.
/***************************************************************************************************
 * APPLICATION IMPORTS
 */


/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("./src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map