// Type declarations for CDN-loaded libraries (gsap, ScrollTrigger, Lenis)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GsapTarget = Element | Element[] | string | object | null;
type GsapVars = Record<string, unknown>;

interface GsapTween {
  kill(): void;
  pause(): void;
  resume(): void;
  timeScale(value: number): GsapTween;
}

interface GsapTimeline extends GsapTween {
  to(targets: GsapTarget, vars: GsapVars, position?: string | number): GsapTimeline;
  from(targets: GsapTarget, vars: GsapVars, position?: string | number): GsapTimeline;
  set(targets: GsapTarget, vars: GsapVars, position?: string | number): GsapTimeline;
  add(callback: () => void, position?: string | number): GsapTimeline;
}

interface GsapMatchMedia {
  add(conditions: string, fn: () => (() => void) | void): GsapMatchMedia;
}

interface GsapTicker {
  add(fn: (time: number, delta: number, frame: number) => void): void;
  lagSmoothing(threshold: number, interval?: number): void;
}

declare const gsap: {
  registerPlugin(...args: object[]): void;
  ticker: GsapTicker;
  timeline(vars?: GsapVars): GsapTimeline;
  to(targets: GsapTarget, vars: GsapVars): GsapTween;
  from(targets: GsapTarget, vars: GsapVars): GsapTween;
  fromTo(targets: GsapTarget, fromVars: GsapVars, toVars: GsapVars): GsapTween;
  set(targets: GsapTarget, vars: GsapVars): GsapTween;
  matchMedia(): GsapMatchMedia;
};

interface ScrollTriggerInstance {
  progress: number;
  kill(): void;
  refresh(): void;
  update(): void;
}

declare const ScrollTrigger: {
  create(vars: GsapVars): ScrollTriggerInstance;
  refresh(): void;
  update(): void;
  getAll(): ScrollTriggerInstance[];
};

declare class Lenis {
  constructor(options?: Record<string, unknown>);
  raf(time: number): void;
  start(): void;
  stop(): void;
  scrollTo(target: string | number | Element, options?: Record<string, unknown>): void;
  on(event: string, fn: (data: { scroll: number; [key: string]: unknown }) => void): void;
}
