import { store } from "/js/store.js";
import { PERSONA_ROUTES } from "/js/router.js";

const PERSONAS = [
  { key: "candidate", label: "Candidate" },
  { key: "callCenter", label: "Call Center" },
  { key: "bookingAdmin", label: "Booking Admin" },
  { key: "centerAdmin", label: "Center Admin" },
  { key: "proctor", label: "Proctor" },
  { key: "itemAuthor", label: "Item Author" },
  { key: "examOps", label: "Exam Ops" },
  { key: "scoreAnalyst", label: "Score Analyst" },
  { key: "noc", label: "NOC" },
  { key: "superAdmin", label: "Super Admin" },
];

export function mountPersonaSwitcher(mountEl, { compact = false } = {}) {
  if (!mountEl) return () => {};

  mountEl.innerHTML = `
    <label class="flex items-center gap-2" aria-label="Persona">
      <span class="hidden lg:inline text-xs track-lg text-ink-3 font-mono">ROLE</span>
      <select
        class="h-9 rounded-xl border border-border bg-surface px-3 text-sm text-ink-2 shadow-sm
               focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0"
      >
        ${PERSONAS.map((p) => `<option value="${p.key}">${p.label}</option>`).join("")}
      </select>
    </label>
  `;

  const select = mountEl.querySelector("select");
  const sync = () => {
    const { persona } = store.getState();
    select.value = persona;
    if (compact) select.setAttribute("aria-label", `Persona: ${persona}`);
  };

  sync();

  select.addEventListener("change", () => {
    const nextPersona = select.value;
    const before = location.hash;

    store.setState({ persona: nextPersona });

    const target = PERSONA_ROUTES?.[nextPersona]?.[0]?.path || "/";
    location.hash = `#${target}`;

    if (before === location.hash) {
      window.dispatchEvent(new Event("hashchange"));
    }
  });

  const unsub = store.subscribe(sync);
  return unsub;
}
