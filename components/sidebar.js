import { store } from "/js/store.js";
import { PERSONA_ROUTES } from "/js/router.js";

const PERSONA_LABELS = {
  candidate: "Candidate",
  callCenter: "Candidate Verifier",
  admissionsAdmin: "Admissions Admin",
  centerAdmin: "Center Admin",
  proctor: "Proctor",
  itemAuthor: "Item Author",
  examOps: "Test Delivery",
  scoreAnalyst: "Score Analyst",
  superAdmin: "Super Admin",
};

function isActive(path) {
  const current = (location.hash || "").replace(/^#/, "") || "/";
  if (path === "/dashboard" && (current === "/" || current === "/dashboard"))
    return true;
  return current === path || current.startsWith(path + "/");
}

function render() {
  const { persona, sidebarOpen, sidebarCollapsed } = store.getState();
  const routes = PERSONA_ROUTES[persona] ?? PERSONA_ROUTES.candidate;
  const personaLabel = PERSONA_LABELS[persona] ?? persona;

  const collapsed = sidebarCollapsed;
  const asideWidth = collapsed ? "md:w-20" : "md:w-72";
  const asidePad = collapsed ? "px-3" : "px-6";
  const headerPad = collapsed ? "p-4" : "p-6";
  const labelCls = collapsed ? "hidden" : "";
  const footerCls = collapsed ? "hidden" : "";

  document.getElementById("sidebar-mount").innerHTML = `
    <div class="md:hidden ${sidebarOpen ? "fixed" : "hidden"} inset-0 z-30 bg-ink/40" id="sidebar-overlay"></div>

    <aside
      class="fixed md:sticky top-0 left-0 z-40 h-screen w-72 ${asideWidth} bg-surface border-r border-border
             flex flex-col transition-all duration-300
             ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
             md:translate-x-0"
      aria-label="Sidebar"
      data-collapsed="${collapsed ? "true" : "false"}"
    >
      <div class="${headerPad} border-b border-border">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="${labelCls}">
              <div class="flex items-baseline gap-2">
                <span class="font-display text-2xl text-primary">Admission Test System</span>
              </div>
              <p class="mt-2 text-sm text-ink-2">Role: <span class="font-mono text-xs track-sm">${personaLabel}</span></p>
            </div>
          </div>

          <button
            id="sidebar-collapse"
            type="button"
            class="hidden md:inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border bg-surface
                   hover:bg-primary-muted hover:text-primary transition-colors"
            aria-label="${collapsed ? "Expand sidebar" : "Collapse sidebar"}"
            aria-pressed="${collapsed ? "true" : "false"}"
            title="${collapsed ? "Expand" : "Collapse"}"
          >
            <span class="font-mono text-xs">${collapsed ? "»" : "«"}</span>
          </button>
        </div>
      </div>

      <nav class="flex-1 py-4" aria-label="Navigation">
        ${routes
          .map((r) => {
            const active = isActive(r.path);
            const linkBase = `flex items-center ${collapsed ? "justify-center" : ""} gap-3 ${asidePad} py-3 text-sm text-ink-2
                              hover:bg-primary-muted hover:text-primary transition-colors`;
            const linkActive = active
              ? "bg-primary-muted text-primary font-medium border-r-2 border-primary"
              : "";

            return `
              <a
                href="#${r.path}"
                class="${linkBase} ${linkActive}"
                aria-label="${r.label}"
                title="${collapsed ? r.label : ""}"
              >
                <span class="opacity-70 w-6 text-center">${r.icon}</span>
                <span class="${labelCls}">${r.label}</span>
              </a>
            `;
          })
          .join("")}
      </nav>

      <div class="p-6 border-t border-border ${footerCls}">
        <p class="text-xs text-ink-3 font-mono track-md">STATIC DEMO · CDN ONLY</p>
      </div>
    </aside>
  `;

  const overlay = document.getElementById("sidebar-overlay");
  overlay?.addEventListener("click", () =>
    store.setState({ sidebarOpen: false }),
  );

  document.getElementById("sidebar-collapse")?.addEventListener("click", () => {
    const { sidebarCollapsed: c } = store.getState();
    store.setState({ sidebarCollapsed: !c });
  });

  document
    .getElementById("sidebar-mount")
    .querySelectorAll("aside a")
    .forEach((a) => {
      a.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 767px)").matches) {
          store.setState({ sidebarOpen: false });
        }
      });
    });
}

store.subscribe(render);
window.addEventListener("hashchange", render);
render();
