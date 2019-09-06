# <pinch-zoom>

Forked from https://github.com/GoogleChromeLabs/pinch-zoom

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

To limit the amount the image can be zoomed in/out use the following attributes on the pinch-zoom element.
min-scale
max-scale

This should limit the zoom in scale to 6 times the original size of the image and limit the zoom out scale to 1/2 the size.
```html
<pinch-zoom min-scale=".5" max-scale="6">
  <h1>Hello!</h1>
</pinch-zoom>
```

To prevent movement of the element until it's scaled add the following attribute set to true.
no-panning-until-scaled
```html
<pinch-zoom no-panning-until-scaled="true">
  <h1>This can't be moved until scaling first.</h1>
</pinch-zoom>
```

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

## Building the source code locally
```sh
git clone https://github.com/guitarcenterdev/pinch-zoom.git
npm install
npm run build
```

## Demo

[Simple image pinch-zoom](https://pinch-zoom-element.glitch.me/). Although you can put any element in `<pinch-zoom>`.

## Files

* `lib/index.ts` - Original TypeScript.
* `dist/pinch-zoom.mjs` - JS module. Default exports `PinchZoom`.
* `dist/pinch-zoom.js` - Plain JS. Exposes `PinchZoom` on the global.
* `dist/pinch-zoom-min.js` - Minified plain JS. 2.3k gzipped.
