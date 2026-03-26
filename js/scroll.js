// GSAP and Lenis are globals from CDN — no imports needed.

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0); // MANDATORY — no lag compensation

export const lenis = new Lenis({
  lerp: 0.08, // buttery, weighty feel — do not change
  smoothWheel: true,
  autoRaf: false, // GSAP ticker owns the RAF loop — critical
});

// Feed Lenis into GSAP's RAF — THE sync mechanism
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Keep ScrollTrigger in sync with Lenis virtual scroll position
lenis.on("scroll", ScrollTrigger.update);

// Expose globally for pages that need lenis.stop() / lenis.start()
window.__lenis = lenis;
