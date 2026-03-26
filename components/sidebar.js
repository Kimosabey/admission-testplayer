import { store } from "/js/store.js";
import { PERSONA_ROUTES } from "/js/router.js";

function isActive(path) {
  const current = (location.hash || "").replace(/^#/, "") || "/";
  if (path === "/dashboard" && (current === "/" || current === "/dashboard")) return true;
  return current === path || current.startsWith(path + "/");
}

function render() {
  const { persona, sidebarOpen } = store.getState();
  const routes = PERSONA_ROUTES[persona] ?? PERSONA_ROUTES.candidate;

  document.getElementById("sidebar-mount").innerHTML = `
    <div class="md:hidden ${sidebarOpen ? "fixed" : "hidden"} inset-0 z-30 bg-ink/40" id="sidebar-overlay"></div>

    <aside
      class="fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-surface border-r border-border
             flex flex-col transition-transform duration-300
             ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
             md:translate-x-0"
      aria-label="Sidebar"
    >
      <div class="p-6 border-b border-border">
        <div class="flex items-baseline gap-2">
          <span class="font-display text-2xl text-primary">ATP</span>
          <span class="text-xs text-ink-3 font-mono track-xl">NAV</span>
        </div>
        <p class="mt-2 text-sm text-ink-2">Persona: <span class="font-mono text-xs track-sm">${persona}</span></p>
      </div>

      <nav class="flex-1 py-4">
        ${routes
          .map((r) => {
            const active = isActive(r.path);
            return `
              <a
                href="#${r.path}"
                class="flex items-center gap-3 px-6 py-3 text-sm text-ink-2
                       hover:bg-primary-muted hover:text-primary transition-colors
                       ${
                         active
                           ? "bg-primary-muted text-primary font-medium border-r-2 border-primary"
                           : ""
                       }"
              >
                <span class="opacity-60 w-4 text-center">${r.icon}</span>
                ${r.label}
              </a>
            `;
          })
          .join("")}
      </nav>

      <div class="p-6 border-t border-border">
        <p class="text-xs text-ink-3 font-mono track-md">STATIC DEMO · CDN ONLY</p>
      </div>
    </aside>
  `;

  const overlay = document.getElementById("sidebar-overlay");
  overlay?.addEventListener("click", () => store.setState({ sidebarOpen: false }));

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
