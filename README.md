## To Do:
* custom animation options
* allow different types of animations
* write tests
* figure out triggers
  * attribute-driven
  * imperative
* make core constructor return imperative methods

## Setting Up Steps

Define steps in your HTML in two ways -- either by making them immediate children of your target element:

```html
<div id="steppp">
  <div data-stepppp-wrapper>
    <section data-steppp-active>first</section>
    <section>second</section>
    <section>third</section>
  </div>
</div>
```dsd

... or, by wrapping them in an element with a `data-stepppp-wrapper` attribute:

```html
<div id="steppp">
  <div data-stepppp-wrapper>
    <section data-steppp-active>first</section>
    <section>second</section>
    <section>third</section>
  </div>
</div>
```

## Usage

Create a new instance by calling `Steppp` and passing a target element. Functions will be returned for moving forward, backward, or directly to a specific step.

```js
const element = document.getElementById('targetElement');
const { next, previous, moveTo } = Steppp(element);

document.querySelector('#next').addEventListener('click', () => {
  next();
});

document.querySelector('#previous').addEventListener('click', () => {
  previous();
});
```

<!--
### Advancing Through Steps Out-of-Order

Sometimes, you may want to skip over certain steps and progress to one out of order. To do this, place a `data-steppp-go-to="YOUR_STEP_NAME"` attribute on the element that triggers the movement. -->
