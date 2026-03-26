export function Badge(label, { tone = "neutral", mono = false } = {}) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";
  const monoClass = mono ? "font-mono track-xs" : "font-body";
  const toneClass =
    tone === "primary"
      ? "bg-primary-muted text-primary border-border"
      : tone === "accent"
        ? "bg-accent-muted text-warning border-border"
        : "bg-surface text-ink-2 border-border";

  return `<span class="${base} ${monoClass} ${toneClass}">${label}</span>`;
}
