var PinchZoom = (function () {
    'use strict';

    class Pointer {
        constructor(nativePointer) {
            /** Unique ID for this pointer */
            this.id = -1;
            this.nativePointer = nativePointer;
            this.pageX = nativePointer.pageX;
            this.pageY = nativePointer.pageY;
            this.clientX = nativePointer.clientX;
            this.clientY = nativePointer.clientY;
            if (self.Touch && nativePointer instanceof Touch) {
                this.id = nativePointer.identifier;
            }
            else if (isPointerEvent(nativePointer)) {
                // is PointerEvent
                this.id = nativePointer.pointerId;
            }
        }
        /**
         * Returns an expanded set of Pointers for high-resolution inputs.
         */
        getCoalesced() {
            if ('getCoalescedEvents' in this.nativePointer) {
                return this.nativePointer.getCoalescedEvents().map((p) => new Pointer(p));
            }
            return [this];
        }
    }
    const isPointerEvent = (event) => self.PointerEvent && event instanceof PointerEvent;
    const noop = () => { };
    /**
     * Track pointers across a particular element
     */
    class PointerTracker {
        /**
         * Track pointers across a particular element
         *
         * @param element Element to monitor.
         * @param options
         */
        constructor(_element, { start = () => true, move = noop, end = noop, rawUpdates = false, } = {}) {
            this._element = _element;
            /**
             * State of the tracked pointers when they were pressed/touched.
             */
            this.startPointers = [];
            /**
             * Latest state of the tracked pointers. Contains the same number of pointers, and in the same
             * order as this.startPointers.
             */
            this.currentPointers = [];
            /**
             * Listener for mouse/pointer starts.
             *
             * @param event This will only be a MouseEvent if the browser doesn't support pointer events.
             */
            this._pointerStart = (event) => {
                if (event.button !== 0 /* Left */)
                    return;
                if (!this._triggerPointerStart(new Pointer(event), event))
                    return;
                // Add listeners for additional events.
                // The listeners may already exist, but no harm in adding them again.
                if (isPointerEvent(event)) {
                    const capturingElement = event.target && 'setPointerCapture' in event.target
                        ? event.target
                        : this._element;
                    capturingElement.setPointerCapture(event.pointerId);
                    this._element.addEventListener(this._rawUpdates ? 'pointerrawupdate' : 'pointermove', this._move);
                    this._element.addEventListener('pointerup', this._pointerEnd);
                    this._element.addEventListener('pointercancel', this._pointerEnd);
                }
                else {
                    // MouseEvent
                    window.addEventListener('mousemove', this._move);
                    window.addEventListener('mouseup', this._pointerEnd);
                }
            };
            /**
             * Listener for touchstart.
             * Only used if the browser doesn't support pointer events.
             */
            this._touchStart = (event) => {
                for (const touch of Array.from(event.changedTouches)) {
                    this._triggerPointerStart(new Pointer(touch), event);
                }
            };
            /**
             * Listener for pointer/mouse/touch move events.
             */
            this._move = (event) => {
                const previousPointers = this.currentPointers.slice();
                const changedPointers = 'changedTouches' in event // Shortcut for 'is touch event'.
                    ? Array.from(event.changedTouches).map((t) => new Pointer(t))
                    : [new Pointer(event)];
                const trackedChangedPointers = [];
                for (const pointer of changedPointers) {
                    const index = this.currentPointers.findIndex((p) => p.id === pointer.id);
                    if (index === -1)
                        continue; // Not a pointer we're tracking
                    trackedChangedPointers.push(pointer);
                    this.currentPointers[index] = pointer;
                }
                if (trackedChangedPointers.length === 0)
                    return;
                this._moveCallback(previousPointers, trackedChangedPointers, event);
            };
            /**
             * Call the end callback for this pointer.
             *
             * @param pointer Pointer
             * @param event Related event
             */
            this._triggerPointerEnd = (pointer, event) => {
                const index = this.currentPointers.findIndex((p) => p.id === pointer.id);
                // Not a pointer we're interested in?
                if (index === -1)
                    return false;
                this.currentPointers.splice(index, 1);
                this.startPointers.splice(index, 1);
                const cancelled = event.type === 'touchcancel' || event.type === 'pointercancel';
                this._endCallback(pointer, event, cancelled);
                return true;
            };
            /**
             * Listener for mouse/pointer ends.
             *
             * @param event This will only be a MouseEvent if the browser doesn't support pointer events.
             */
            this._pointerEnd = (event) => {
                if (!this._triggerPointerEnd(new Pointer(event), event))
                    return;
                if (isPointerEvent(event)) {
                    if (this.currentPointers.length)
                        return;
                    this._element.removeEventListener(this._rawUpdates ? 'pointerrawupdate' : 'pointermove', this._move);
                    this._element.removeEventListener('pointerup', this._pointerEnd);
                    this._element.removeEventListener('pointercancel', this._pointerEnd);
                }
                else {
                    // MouseEvent
                    window.removeEventListener('mousemove', this._move);
                    window.removeEventListener('mouseup', this._pointerEnd);
                }
            };
            /**
             * Listener for touchend.
             * Only used if the browser doesn't support pointer events.
             */
            this._touchEnd = (event) => {
                for (const touch of Array.from(event.changedTouches)) {
                    this._triggerPointerEnd(new Pointer(touch), event);
                }
            };
            this._startCallback = start;
            this._moveCallback = move;
            this._endCallback = end;
            this._rawUpdates = rawUpdates && 'onpointerrawupdate' in window;
            // Add listeners
            if (self.PointerEvent) {
                this._element.addEventListener('pointerdown', this._pointerStart);
            }
            else {
                this._element.addEventListener('mousedown', this._pointerStart);
                this._element.addEventListener('touchstart', this._touchStart);
                this._element.addEventListener('touchmove', this._move);
                this._element.addEventListener('touchend', this._touchEnd);
                this._element.addEventListener('touchcancel', this._touchEnd);
            }
        }
        /**
         * Remove all listeners.
         */
        stop() {
            this._element.removeEventListener('pointerdown', this._pointerStart);
            this._element.removeEventListener('mousedown', this._pointerStart);
            this._element.removeEventListener('touchstart', this._touchStart);
            this._element.removeEventListener('touchmove', this._move);
            this._element.removeEventListener('touchend', this._touchEnd);
            this._element.removeEventListener('touchcancel', this._touchEnd);
            this._element.removeEventListener(this._rawUpdates ? 'pointerrawupdate' : 'pointermove', this._move);
            this._element.removeEventListener('pointerup', this._pointerEnd);
            this._element.removeEventListener('pointercancel', this._pointerEnd);
            window.removeEventListener('mousemove', this._move);
            window.removeEventListener('mouseup', this._pointerEnd);
        }
        /**
         * Call the start callback for this pointer, and track it if the user wants.
         *
         * @param pointer Pointer
         * @param event Related event
         * @returns Whether the pointer is being tracked.
         */
        _triggerPointerStart(pointer, event) {
            if (!this._startCallback(pointer, event))
                return false;
            this.currentPointers.push(pointer);
            this.startPointers.push(pointer);
            return true;
        }
    }

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css = "pinch-zoom {\n  display: block;\n  overflow: hidden;\n  touch-action: none;\n  --scale: 1;\n  --x: 0;\n  --y: 0;\n}\n\npinch-zoom > * {\n  transform: translate(var(--x), var(--y)) scale(var(--scale));\n  transform-origin: 0 0;\n  will-change: transform;\n}\n";
    styleInject(css);

    const minScaleAttr = 'min-scale';
    const maxScaleAttr = 'max-scale';
    const noDefaultPanAttr = 'no-default-pan';
    const twoFingerPanAttr = 'two-finger-pan';
    function getDistance(a, b) {
        if (!b)
            return 0;
        return Math.sqrt((b.clientX - a.clientX) ** 2 + (b.clientY - a.clientY) ** 2);
    }
    function getMidpoint(a, b) {
        if (!b)
            return a;
        return {
            clientX: (a.clientX + b.clientX) / 2,
            clientY: (a.clientY + b.clientY) / 2,
        };
    }
    function getAbsoluteValue(value, max) {
        if (typeof value === 'number')
            return value;
        if (value.trimRight().endsWith('%')) {
            return max * parseFloat(value) / 100;
        }
        return parseFloat(value);
    }
    // I'd rather use DOMMatrix/DOMPoint here, but the browser support isn't good enough.
    // Given that, better to use something everything supports.
    let cachedSvg;
    function getSVG() {
        return cachedSvg || (cachedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    }
    function createMatrix() {
        return getSVG().createSVGMatrix();
    }
    function createPoint() {
        return getSVG().createSVGPoint();
    }
    const MIN_SCALE = 0.01;
    const MAX_SCALE = 100.00;
    class PinchZoom extends HTMLElement {
        constructor() {
            super();
            // Current transform.
            this._transform = createMatrix();
            //if we are allowing panning
            this._enablePan = true;
            this._twoFingerPan = false;
            // Watch for children changes.
            // Note this won't fire for initial contents,
            // so _stageElChange is also called in connectedCallback.
            new MutationObserver(() => this._stageElChange())
                .observe(this, { childList: true });
            // Watch for pointers
            const pointerTracker = new PointerTracker(this, {
                start: (pointer, event) => {
                    // We only want to track 2 pointers at most
                    if (pointerTracker.currentPointers.length === 2 || !this._positioningEl)
                        return false;
                    //we allow default for the first pointer if enablePan is false or we are using a mouse
                    if (this.enablePan || pointerTracker.currentPointers.length == 1 ||
                        (event instanceof PointerEvent && event.pointerType == "mouse")) {
                        this.enablePan = true; //a second finger automatically enables panning
                        event.preventDefault();
                    }
                    return true;
                },
                move: (previousPointers) => {
                    if (this.enablePan) {
                        this._onPointerMove(previousPointers, pointerTracker.currentPointers);
                    }
                },
                end: (pointer, event, cancelled) => {
                    //revert to no panning when in twoFingerPan mode
                    if (this.twoFingerPan && pointerTracker.currentPointers.length == 1) {
                        this.enablePan = false;
                    }
                },
            });
            this.addEventListener('wheel', event => this._onWheel(event));
        }
        static get observedAttributes() { return [minScaleAttr, maxScaleAttr, noDefaultPanAttr, twoFingerPanAttr]; }
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === minScaleAttr) {
                if (this.scale < this.minScale) {
                    this.setTransform({ scale: this.minScale });
                }
            }
            if (name === maxScaleAttr) {
                if (this.scale > this.maxScale) {
                    this.setTransform({ scale: this.maxScale });
                }
            }
            if (name === noDefaultPanAttr) {
                if (newValue == "1" || newValue == "true") {
                    this.enablePan = false;
                }
                else {
                    this.enablePan = true;
                }
            }
            if (name === twoFingerPanAttr) {
                if (newValue == "1" || newValue == "true") {
                    this.twoFingerPan = true;
                    this.enablePan = false;
                }
                else {
                    this.twoFingerPan = false;
                }
            }
        }
        get minScale() {
            const attrValue = this.getAttribute(minScaleAttr);
            if (!attrValue)
                return MIN_SCALE;
            const value = parseFloat(attrValue);
            if (Number.isFinite(value))
                return Math.max(MIN_SCALE, value);
            return MIN_SCALE;
        }
        set minScale(value) {
            this.setAttribute(minScaleAttr, String(value));
        }
        get maxScale() {
            const attrValue = this.getAttribute(maxScaleAttr);
            if (!attrValue)
                return MAX_SCALE;
            const value = parseFloat(attrValue);
            if (Number.isFinite(value))
                return Math.min(MAX_SCALE, value);
            return MAX_SCALE;
        }
        set maxScale(value) {
            this.setAttribute(maxScaleAttr, String(value));
        }
        set enablePan(value) {
            this._enablePan = value;
            if (!this._enablePan) {
                this.style.touchAction = 'pan-y pan-x';
            }
            else if (this._enablePan && this.style.touchAction != 'none') {
                this.style.touchAction = 'none';
            }
        }
        get enablePan() {
            return this._enablePan;
        }
        set twoFingerPan(value) {
            this._twoFingerPan = value;
        }
        get twoFingerPan() {
            return this._twoFingerPan;
        }
        connectedCallback() {
            this._stageElChange();
        }
        get x() {
            return this._transform.e;
        }
        get y() {
            return this._transform.f;
        }
        get scale() {
            return this._transform.a;
        }
        /**
         * Change the scale, adjusting x/y by a given transform origin.
         */
        scaleTo(scale, opts = {}) {
            let { originX = 0, originY = 0, } = opts;
            const { relativeTo = 'content', allowChangeEvent = false, } = opts;
            const relativeToEl = (relativeTo === 'content' ? this._positioningEl : this);
            // No content element? Fall back to just setting scale
            if (!relativeToEl || !this._positioningEl) {
                this.setTransform({ scale, allowChangeEvent });
                return;
            }
            const rect = relativeToEl.getBoundingClientRect();
            originX = getAbsoluteValue(originX, rect.width);
            originY = getAbsoluteValue(originY, rect.height);
            if (relativeTo === 'content') {
                originX += this.x;
                originY += this.y;
            }
            else {
                const currentRect = this._positioningEl.getBoundingClientRect();
                originX -= currentRect.left;
                originY -= currentRect.top;
            }
            this._applyChange({
                allowChangeEvent,
                originX,
                originY,
                scaleDiff: scale / this.scale,
            });
        }
        /**
         * Update the stage with a given scale/x/y.
         */
        setTransform(opts = {}) {
            const { scale = this.scale, allowChangeEvent = false, } = opts;
            let { x = this.x, y = this.y, } = opts;
            // If we don't have an element to position, just set the value as given.
            // We'll check bounds later.
            if (!this._positioningEl) {
                this._updateTransform(scale, x, y, allowChangeEvent);
                return;
            }
            // Get current layout
            const thisBounds = this.getBoundingClientRect();
            const positioningElBounds = this._positioningEl.getBoundingClientRect();
            // Not displayed. May be disconnected or display:none.
            // Just take the values, and we'll check bounds later.
            if (!thisBounds.width || !thisBounds.height) {
                this._updateTransform(scale, x, y, allowChangeEvent);
                return;
            }
            // Create points for _positioningEl.
            let topLeft = createPoint();
            topLeft.x = positioningElBounds.left - thisBounds.left;
            topLeft.y = positioningElBounds.top - thisBounds.top;
            let bottomRight = createPoint();
            bottomRight.x = positioningElBounds.width + topLeft.x;
            bottomRight.y = positioningElBounds.height + topLeft.y;
            // Calculate the intended position of _positioningEl.
            const matrix = createMatrix()
                .translate(x, y)
                .scale(scale)
                // Undo current transform
                .multiply(this._transform.inverse());
            topLeft = topLeft.matrixTransform(matrix);
            bottomRight = bottomRight.matrixTransform(matrix);
            // Ensure _positioningEl can't move beyond out-of-bounds.
            // Correct for x
            if (topLeft.x > thisBounds.width) {
                x += thisBounds.width - topLeft.x;
            }
            else if (bottomRight.x < 0) {
                x += -bottomRight.x;
            }
            // Correct for y
            if (topLeft.y > thisBounds.height) {
                y += thisBounds.height - topLeft.y;
            }
            else if (bottomRight.y < 0) {
                y += -bottomRight.y;
            }
            this._updateTransform(scale, x, y, allowChangeEvent);
        }
        /**
         * Update transform values without checking bounds. This is only called in setTransform.
         */
        _updateTransform(scale, x, y, allowChangeEvent) {
            // Avoid scaling to zero
            if (scale < this.minScale)
                return;
            if (scale > this.maxScale)
                return;
            // Return if there's no change
            if (scale === this.scale &&
                x === this.x &&
                y === this.y)
                return;
            this._transform.e = x;
            this._transform.f = y;
            this._transform.d = this._transform.a = scale;
            this.style.setProperty('--x', this.x + 'px');
            this.style.setProperty('--y', this.y + 'px');
            this.style.setProperty('--scale', this.scale + '');
            if (allowChangeEvent) {
                const event = new Event('change', { bubbles: true });
                this.dispatchEvent(event);
            }
        }
        /**
         * Called when the direct children of this element change.
         * Until we have have shadow dom support across the board, we
         * require a single element to be the child of <pinch-zoom>, and
         * that's the element we pan/scale.
         */
        _stageElChange() {
            this._positioningEl = undefined;
            if (this.children.length === 0)
                return;
            this._positioningEl = this.children[0];
            if (this.children.length > 1) {
                console.warn('<pinch-zoom> must not have more than one child.');
            }
            // Do a bounds check
            this.setTransform({ allowChangeEvent: true });
        }
        _onWheel(event) {
            if (!this._positioningEl)
                return;
            event.preventDefault();
            const currentRect = this._positioningEl.getBoundingClientRect();
            let { deltaY } = event;
            const { ctrlKey, deltaMode } = event;
            if (deltaMode === 1) { // 1 is "lines", 0 is "pixels"
                // Firefox uses "lines" for some types of mouse
                deltaY *= 15;
            }
            // ctrlKey is true when pinch-zooming on a trackpad.
            const divisor = ctrlKey ? 100 : 300;
            const scaleDiff = 1 - deltaY / divisor;
            this._applyChange({
                scaleDiff,
                originX: event.clientX - currentRect.left,
                originY: event.clientY - currentRect.top,
                allowChangeEvent: true,
            });
        }
        _onPointerMove(previousPointers, currentPointers) {
            if (!this._positioningEl)
                return;
            // Combine next points with previous points
            const currentRect = this._positioningEl.getBoundingClientRect();
            // For calculating panning movement
            const prevMidpoint = getMidpoint(previousPointers[0], previousPointers[1]);
            const newMidpoint = getMidpoint(currentPointers[0], currentPointers[1]);
            // Midpoint within the element
            const originX = prevMidpoint.clientX - currentRect.left;
            const originY = prevMidpoint.clientY - currentRect.top;
            // Calculate the desired change in scale
            const prevDistance = getDistance(previousPointers[0], previousPointers[1]);
            const newDistance = getDistance(currentPointers[0], currentPointers[1]);
            const scaleDiff = prevDistance ? newDistance / prevDistance : 1;
            this._applyChange({
                originX, originY, scaleDiff,
                panX: newMidpoint.clientX - prevMidpoint.clientX,
                panY: newMidpoint.clientY - prevMidpoint.clientY,
                allowChangeEvent: true,
            });
        }
        /** Transform the view & fire a change event */
        _applyChange(opts = {}) {
            const { panX = 0, panY = 0, originX = 0, originY = 0, scaleDiff = 1, allowChangeEvent = false, } = opts;
            const matrix = createMatrix()
                // Translate according to panning.
                .translate(panX, panY)
                // Scale about the origin.
                .translate(originX, originY)
                // Apply current translate
                .translate(this.x, this.y)
                .scale(scaleDiff)
                .translate(-originX, -originY)
                // Apply current scale.
                .scale(this.scale);
            // Convert the transform into basic translate & scale.
            this.setTransform({
                allowChangeEvent,
                scale: matrix.a,
                x: matrix.e,
                y: matrix.f,
            });
        }
    }

    customElements.define('pinch-zoom', PinchZoom);

    return PinchZoom;

}());
