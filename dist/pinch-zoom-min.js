!function(){"use strict";!function(){class t{constructor(t){this.id=-1,this.nativePointer=t,this.pageX=t.pageX,this.pageY=t.pageY,this.clientX=t.clientX,this.clientY=t.clientY,self.Touch&&t instanceof Touch?this.id=t.identifier:e(t)&&(this.id=t.pointerId)}getCoalesced(){return"getCoalescedEvents"in this.nativePointer?this.nativePointer.getCoalescedEvents().map(e=>new t(e)):[this]}}const e=t=>self.PointerEvent&&t instanceof PointerEvent,n=()=>{};class i{constructor(i,{start:s=(()=>!0),move:r=n,end:o=n,rawUpdates:a=!1}={}){this._element=i,this.startPointers=[],this.currentPointers=[],this._pointerStart=(n=>{if(0===n.button&&this._triggerPointerStart(new t(n),n))if(e(n)){(n.target&&"setPointerCapture"in n.target?n.target:this._element).setPointerCapture(n.pointerId),this._element.addEventListener(this._rawUpdates?"pointerrawupdate":"pointermove",this._move),this._element.addEventListener("pointerup",this._pointerEnd),this._element.addEventListener("pointercancel",this._pointerEnd)}else window.addEventListener("mousemove",this._move),window.addEventListener("mouseup",this._pointerEnd)}),this._touchStart=(e=>{for(const n of Array.from(e.changedTouches))this._triggerPointerStart(new t(n),e)}),this._move=(e=>{const n=this.currentPointers.slice(),i="changedTouches"in e?Array.from(e.changedTouches).map(e=>new t(e)):[new t(e)],s=[];for(const t of i){const e=this.currentPointers.findIndex(e=>e.id===t.id);-1!==e&&(s.push(t),this.currentPointers[e]=t)}0!==s.length&&this._moveCallback(n,s,e)}),this._triggerPointerEnd=((t,e)=>{const n=this.currentPointers.findIndex(e=>e.id===t.id);if(-1===n)return!1;this.currentPointers.splice(n,1),this.startPointers.splice(n,1);const i="touchcancel"===e.type||"pointercancel"===e.type;return this._endCallback(t,e,i),!0}),this._pointerEnd=(n=>{if(this._triggerPointerEnd(new t(n),n))if(e(n)){if(this.currentPointers.length)return;this._element.removeEventListener(this._rawUpdates?"pointerrawupdate":"pointermove",this._move),this._element.removeEventListener("pointerup",this._pointerEnd),this._element.removeEventListener("pointercancel",this._pointerEnd)}else window.removeEventListener("mousemove",this._move),window.removeEventListener("mouseup",this._pointerEnd)}),this._touchEnd=(e=>{for(const n of Array.from(e.changedTouches))this._triggerPointerEnd(new t(n),e)}),this._startCallback=s,this._moveCallback=r,this._endCallback=o,this._rawUpdates=a&&"onpointerrawupdate"in window,self.PointerEvent?this._element.addEventListener("pointerdown",this._pointerStart):(this._element.addEventListener("mousedown",this._pointerStart),this._element.addEventListener("touchstart",this._touchStart),this._element.addEventListener("touchmove",this._move),this._element.addEventListener("touchend",this._touchEnd),this._element.addEventListener("touchcancel",this._touchEnd))}stop(){this._element.removeEventListener("pointerdown",this._pointerStart),this._element.removeEventListener("mousedown",this._pointerStart),this._element.removeEventListener("touchstart",this._touchStart),this._element.removeEventListener("touchmove",this._move),this._element.removeEventListener("touchend",this._touchEnd),this._element.removeEventListener("touchcancel",this._touchEnd),this._element.removeEventListener(this._rawUpdates?"pointerrawupdate":"pointermove",this._move),this._element.removeEventListener("pointerup",this._pointerEnd),this._element.removeEventListener("pointercancel",this._pointerEnd),window.removeEventListener("mousemove",this._move),window.removeEventListener("mouseup",this._pointerEnd)}_triggerPointerStart(t,e){return!!this._startCallback(t,e)&&(this.currentPointers.push(t),this.startPointers.push(t),!0)}}!function(t,e){void 0===e&&(e={});var n=e.insertAt;if(t&&"undefined"!=typeof document){var i=document.head||document.getElementsByTagName("head")[0],s=document.createElement("style");s.type="text/css","top"===n&&i.firstChild?i.insertBefore(s,i.firstChild):i.appendChild(s),s.styleSheet?s.styleSheet.cssText=t:s.appendChild(document.createTextNode(t))}}("pinch-zoom {\n  display: block;\n  overflow: hidden;\n  touch-action: none;\n  --scale: 1;\n  --x: 0;\n  --y: 0;\n}\n\npinch-zoom > * {\n  transform: translate(var(--x), var(--y)) scale(var(--scale));\n  transform-origin: 0 0;\n  will-change: transform;\n}\n");const s="min-scale",r="max-scale",o="no-default-pan",a="two-finger-pan";function h(t,e){return e?Math.sqrt((e.clientX-t.clientX)**2+(e.clientY-t.clientY)**2):0}function l(t,e){return e?{clientX:(t.clientX+e.clientX)/2,clientY:(t.clientY+e.clientY)/2}:t}function c(t,e){return"number"==typeof t?t:t.trimRight().endsWith("%")?e*parseFloat(t)/100:parseFloat(t)}let d;function u(){return d||(d=document.createElementNS("http://www.w3.org/2000/svg","svg"))}function m(){return u().createSVGMatrix()}function p(){return u().createSVGPoint()}const g=.01,_=100;class v extends HTMLElement{constructor(){super(),this._transform=m(),this._enablePan=!0,this._twoFingerPan=!1,new MutationObserver(()=>this._stageElChange()).observe(this,{childList:!0});const t=new i(this,{start:(e,n)=>!(2===t.currentPointers.length||!this._positioningEl)&&((this.enablePan||1==t.currentPointers.length||n instanceof PointerEvent&&"mouse"==n.pointerType)&&(this.enablePan=!0,n.preventDefault()),!0),move:e=>{this.enablePan&&this._onPointerMove(e,t.currentPointers)},end:(e,n,i)=>{this.twoFingerPan&&1==t.currentPointers.length&&(this.enablePan=!1)}});this.addEventListener("wheel",t=>this._onWheel(t))}static get observedAttributes(){return[s,r,o,a]}attributeChangedCallback(t,e,n){t===s&&this.scale<this.minScale&&this.setTransform({scale:this.minScale}),t===r&&this.scale>this.maxScale&&this.setTransform({scale:this.maxScale}),t===o&&(this.enablePan="1"!=n&&"true"!=n),t===a&&("1"==n||"true"==n?(this.twoFingerPan=!0,this.enablePan=!1):this.twoFingerPan=!1)}get minScale(){const t=this.getAttribute(s);if(!t)return g;const e=parseFloat(t);return Number.isFinite(e)?Math.max(g,e):g}set minScale(t){this.setAttribute(s,String(t))}get maxScale(){const t=this.getAttribute(r);if(!t)return _;const e=parseFloat(t);return Number.isFinite(e)?Math.min(_,e):_}set maxScale(t){this.setAttribute(r,String(t))}set enablePan(t){this._enablePan=t,this._enablePan?this._enablePan&&"none"!=this.style.touchAction&&(this.style.touchAction="none"):this.style.touchAction="pan-y pan-x"}get enablePan(){return this._enablePan}set twoFingerPan(t){this._twoFingerPan=t}get twoFingerPan(){return this._twoFingerPan}connectedCallback(){this._stageElChange()}get x(){return this._transform.e}get y(){return this._transform.f}get scale(){return this._transform.a}scaleTo(t,e={}){let{originX:n=0,originY:i=0}=e;const{relativeTo:s="content",allowChangeEvent:r=!1}=e,o="content"===s?this._positioningEl:this;if(!o||!this._positioningEl)return void this.setTransform({scale:t,allowChangeEvent:r});const a=o.getBoundingClientRect();if(n=c(n,a.width),i=c(i,a.height),"content"===s)n+=this.x,i+=this.y;else{const t=this._positioningEl.getBoundingClientRect();n-=t.left,i-=t.top}this._applyChange({allowChangeEvent:r,originX:n,originY:i,scaleDiff:t/this.scale})}setTransform(t={}){const{scale:e=this.scale,allowChangeEvent:n=!1}=t;let{x:i=this.x,y:s=this.y}=t;if(!this._positioningEl)return void this._updateTransform(e,i,s,n);const r=this.getBoundingClientRect(),o=this._positioningEl.getBoundingClientRect();if(!r.width||!r.height)return void this._updateTransform(e,i,s,n);let a=p();a.x=o.left-r.left,a.y=o.top-r.top;let h=p();h.x=o.width+a.x,h.y=o.height+a.y;const l=m().translate(i,s).scale(e).multiply(this._transform.inverse());a=a.matrixTransform(l),h=h.matrixTransform(l),a.x>r.width?i+=r.width-a.x:h.x<0&&(i+=-h.x),a.y>r.height?s+=r.height-a.y:h.y<0&&(s+=-h.y),this._updateTransform(e,i,s,n)}_updateTransform(t,e,n,i){if(!(t<this.minScale)&&!(t>this.maxScale)&&(t!==this.scale||e!==this.x||n!==this.y)&&(this._transform.e=e,this._transform.f=n,this._transform.d=this._transform.a=t,this.style.setProperty("--x",this.x+"px"),this.style.setProperty("--y",this.y+"px"),this.style.setProperty("--scale",this.scale+""),i)){const t=new Event("change",{bubbles:!0});this.dispatchEvent(t)}}_stageElChange(){this._positioningEl=void 0,0!==this.children.length&&(this._positioningEl=this.children[0],this.children.length>1&&console.warn("<pinch-zoom> must not have more than one child."),this.setTransform({allowChangeEvent:!0}))}_onWheel(t){if(!this._positioningEl)return;t.preventDefault();const e=this._positioningEl.getBoundingClientRect();let{deltaY:n}=t;const{ctrlKey:i,deltaMode:s}=t;1===s&&(n*=15);const r=1-n/(i?100:300);this._applyChange({scaleDiff:r,originX:t.clientX-e.left,originY:t.clientY-e.top,allowChangeEvent:!0})}_onPointerMove(t,e){if(!this._positioningEl)return;const n=this._positioningEl.getBoundingClientRect(),i=l(t[0],t[1]),s=l(e[0],e[1]),r=i.clientX-n.left,o=i.clientY-n.top,a=h(t[0],t[1]),c=h(e[0],e[1]),d=a?c/a:1;this._applyChange({originX:r,originY:o,scaleDiff:d,panX:s.clientX-i.clientX,panY:s.clientY-i.clientY,allowChangeEvent:!0})}_applyChange(t={}){const{panX:e=0,panY:n=0,originX:i=0,originY:s=0,scaleDiff:r=1,allowChangeEvent:o=!1}=t,a=m().translate(e,n).translate(i,s).translate(this.x,this.y).scale(r).translate(-i,-s).scale(this.scale);this.setTransform({allowChangeEvent:o,scale:a.a,x:a.e,y:a.f})}}customElements.define("pinch-zoom",v)}()}();
