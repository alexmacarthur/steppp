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

export const fireCustomEvent = ({ oldStep, newStep, element, name }: {
  oldStep: HTMLElement;
  newStep: HTMLElement;
  element: HTMLElement;
  name: string;
}): void => {
  const event = new CustomEvent(name, {
    detail: {
      oldStep, newStep, element
    }
  });

  element.dispatchEvent(event);
}

export const afterRepaint = (cb: () => any): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cb();
    });
  });
}
