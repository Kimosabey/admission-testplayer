export async function fetchData(filename) {
  const res = await fetch(`/data/${filename}.json`);
  if (!res.ok) throw new Error(`Failed to load ${filename}.json`);
  return res.json();
}

export const STATUS_COLORS = {
  booked: { bg: "bg-info-muted", text: "text-info", dot: "#1B5E93" },
  "checked-in": { bg: "bg-primary-muted", text: "text-primary", dot: "#0A3D1F" },
  "in-progress": { bg: "bg-warning-muted", text: "text-warning", dot: "#D4850A" },
  completed: { bg: "bg-success-muted", text: "text-success", dot: "#1A6B38" },
  "no-show": { bg: "bg-danger-muted", text: "text-danger", dot: "#C0392B" },
  draft: { bg: "bg-surface-sunken", text: "text-ink-3", dot: "#7A7A73" },
  "peer-review": { bg: "bg-info-muted", text: "text-info", dot: "#1B5E93" },
  "sme-review": { bg: "bg-accent-muted", text: "text-warning", dot: "#D4850A" },
  "bias-qa": { bg: "bg-warning-muted", text: "text-warning", dot: "#D4850A" },
  approved: { bg: "bg-primary-muted", text: "text-primary", dot: "#0A3D1F" },
  published: { bg: "bg-success-muted", text: "text-success", dot: "#1A6B38" },
  retired: { bg: "bg-surface-sunken", text: "text-ink-3", dot: "#7A7A73" },
  info: { bg: "bg-info-muted", text: "text-info", dot: "#1B5E93" },
  warning: { bg: "bg-warning-muted", text: "text-warning", dot: "#D4850A" },
  critical: { bg: "bg-danger-muted", text: "text-danger", dot: "#C0392B" },
  sealed: { bg: "bg-surface-sunken", text: "text-ink-3", dot: "#7A7A73" },
  open: { bg: "bg-success-muted", text: "text-success", dot: "#1A6B38" },
  expired: { bg: "bg-danger-muted", text: "text-danger", dot: "#C0392B" },
};

export const CANDIDATE_STATUSES = ["booked", "checked-in", "in-progress", "completed", "no-show"];
export const QUESTION_STATUSES = [
  "draft",
  "peer-review",
  "sme-review",
  "bias-qa",
  "approved",
  "published",
  "retired",
];
export const PACK_STATUSES = ["assembling", "sealed", "dispatched", "open", "expired"];
export const ALERT_SEVERITIES = ["info", "warning", "critical"];
export const SESSION_STATUSES = ["scheduled", "live", "completed", "cancelled"];

export function formatDate(dateLike, opts = {}) {
  if (!dateLike) return "";

  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";

  const fmt = new Intl.DateTimeFormat(opts.locale ?? "en-IN", {
    year: opts.year ?? "numeric",
    month: opts.month ?? "short",
    day: opts.day ?? "2-digit",
    ...(opts.time
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });

  return fmt.format(d);
}

export function formatRelativeTime(dateLike, { now = Date.now() } = {}) {
  if (!dateLike) return "";
  const t = dateLike instanceof Date ? dateLike.getTime() : new Date(dateLike).getTime();
  if (Number.isNaN(t)) return "";

  const deltaMs = t - now;
  const abs = Math.abs(deltaMs);
  const isFuture = deltaMs > 0;

  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);

  if (minutes < 60) return isFuture ? `in ${minutes}m` : `${minutes}m ago`;
  if (hours < 48) return isFuture ? `in ${hours}h` : `${hours}h ago`;
  return isFuture ? `in ${days}d` : `${days}d ago`;
}
