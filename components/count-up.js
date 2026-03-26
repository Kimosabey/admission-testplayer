export function CountUp(el, target, opts = {}) {
  if (!el) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    el.textContent = Math.round(target).toLocaleString();
    return;
  }

  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: opts.duration ?? 1.4,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 90%" },
    onUpdate: () => {
      el.textContent = Math.round(obj.val).toLocaleString();
    },
  });
}
