import { STATUS_COLORS } from "/js/utils.js";

export function StatusPill(status, size = "md") {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.draft;
  const sz = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return `
    <span class="inline-flex items-center gap-1.5 rounded-full border font-body font-medium ${sz} ${c.bg} ${c.text}">
      <span class="w-1.5 h-1.5 rounded-full" style="background:${c.dot}"></span>
      ${String(status).replace(/-/g, " ")}
    </span>
  `;
}
