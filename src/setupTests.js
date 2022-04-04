global.beforeEach(() => {
  Element.prototype.animate = (frames, options) => {
    return {
      commitStyles: () => {},
      persist: () => {},
      finished: Promise.resolve(true),
    };
  };
  class ResizeObserver {
    observe() {
      // do nothing
    }
    unobserve() {
      // do nothing
    }
    disconnect() {
        // do nothing
    }
  }

  window.ResizeObserver = ResizeObserver;
});
