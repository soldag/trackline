export const isMobile = (): boolean =>
  ("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
  /Android|iPhone|iPad/i.test(navigator.userAgent);
