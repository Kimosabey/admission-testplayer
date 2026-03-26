function safeId() {
  return `hash_${Math.random().toString(16).slice(2)}`;
}

export function HashDisplay(hash, { label = "Hash" } = {}) {
  const id = safeId();
  const value = String(hash ?? "");

  return `
    <div class="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2" data-hash-display>
      <span class="text-xs font-mono track-md text-ink-3">${label.toUpperCase()}</span>
      <code id="${id}" class="text-sm font-mono text-ink-2">${value}</code>
      <button
        type="button"
        class="ml-1 inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border bg-surface
               hover:bg-primary-muted hover:text-primary transition-colors"
        aria-label="Copy ${label}"
        data-copy-target="${id}"
      >
        ⧉
      </button>
    </div>
  `;
}

export function mountHashCopy(root = document) {
  root.querySelectorAll("[data-hash-display] [data-copy-target]").forEach((btn) => {
    if (btn.__wired) return;
    btn.__wired = true;

    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-copy-target");
      const el = root.getElementById ? root.getElementById(id) : document.getElementById(id);
      const text = el?.textContent ?? "";

      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "✓";
        setTimeout(() => (btn.textContent = "⧉"), 900);
      } catch {
        // no-op
      }
    });
  });
}
