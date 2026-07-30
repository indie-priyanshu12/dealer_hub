import '@testing-library/jest-dom';

// jsdom has no IntersectionObserver, which framer-motion's whileInView requires.
// A no-op stand-in is enough: components render, and "in view" reveals simply
// don't fire (tests assert on content, not on scroll-reveal animation state).
if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}
