type BuildAnimationArgs = {
  frames: any[]
  targetElement: HTMLElement,
  options: KeyframeAnimationOptions
}

const defaults: KeyframeAnimationOptions = {
  easing: "ease",
  duration: 500,
  fill: "forwards"
};

export const buildAnimation = ({ frames, targetElement, options = {} }: BuildAnimationArgs) => {
  return targetElement.animate(frames, { ...defaults, ...options });
}

export const getHeight = (element: HTMLElement): number => {
  return element.getBoundingClientRect().height;
}

export const fireCustomEvent = ({ step, element, name }: {
  step: HTMLElement;
  element: HTMLElement
  name: string
}): void => {
  const event = new CustomEvent(name, {
    detail: {
      step
    }
  });

  element.dispatchEvent(event);
}
