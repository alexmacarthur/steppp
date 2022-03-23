global.beforeEach(() => {
  Element.prototype.animate = (frames, options) => {
    return {
      commitStyles: () => {},
      persist: () => {},
      finished: Promise.resolve(true),
    };
  };
});
