# <pinch-zoom>

A web component for pinch zooming DOM elements.

## Usage

```sh
npm install --save-dev pinch-zoom-element
```

```html
<pinch-zoom>
  <h1>Hello!</h1>
</pinch-zoom>
```

Now the above can be pinch-zoomed!

## API

```html
<pinch-zoom class="my-pinch-zoom">
  <h1>Hello!</h1>
</pinch-zoom>
<script>
  const pinchZoom = document.querySelector('.my-pinch-zoom');
</script>
```

### Properties

```js
pinchZoom.x; // x offset
pinchZoom.y; // y offset
pinchZoom.scale; // scale
```

### Methods

Set the transform. All values are optional.

```js
pinchZoom.setTransform({
  scale: 1,
  x: 0,
  y: 0,
  // Fire a 'change' event if values are different to current values
  allowChangeEvent: false,
});
```

Scale in/out of a particular point.

```js
pinchZoom.scaleTo(scale, {
  // Transform origin. Can be a number, or string percent, eg "50%"
  originX: 0,
  originY: 0,
  // Should the transform origin be relative to the container, or content?
  relativeTo: 'content',
  // Fire a 'change' event if values are different to current values
  allowChangeEvent: false,
});
```

## Demo

[Simple image pinch-zoom](https://pinch-zoom-element.glitch.me/). Although you can put any element in `<pinch-zoom>`.

## Files

* `lib/index.ts` - Original TypeScript.
* `dist/pinch-zoom.mjs` - JS module. Default exports `PinchZoom`.
* `dist/pinch-zoom.js` - Plain JS. Exposes `PinchZoom` on the global.
* `dist/pinch-zoom-min.js` - Minified plain JS. 2.3k gzipped.
