import { store } from "/js/store.js";
import { mountPersonaSwitcher } from "/components/persona-switcher.js";

function render() {
  const { alertCount, darkMode, sidebarOpen } = store.getState();

  document.getElementById("navbar-mount").innerHTML = `
    <header class="sticky top-0 z-30 border-b border-border bg-surface">
      <div class="mx-auto max-w-screen-2xl px-4 sm:px-6">
        <div class="h-16 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <button
              id="sidebar-toggle"
              class="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border bg-surface
                     hover:bg-primary-muted hover:text-primary transition-colors"
              aria-label="Toggle sidebar"
              aria-pressed="${sidebarOpen ? "true" : "false"}"
              type="button"
            >
              <span class="font-mono text-sm">≡</span>
            </button>

            <a href="#/" class="flex items-center gap-3 group" aria-label="Home">
              <img
                src="/public/image.png"
                alt="Examic EdTech"
                class="h-12 w-auto"
                style="filter: drop-shadow(0 1px 0 rgba(0,0,0,0.04));"
              />
              <span class="hidden sm:inline font-mono text-xs track-xl text-ink-3 group-hover:text-primary transition-colors">
                ADMISSION TEST
              </span>
            </a>
          </div>

          <div class="flex items-center gap-3">
            <div id="persona-switcher"></div>

            <!-- Theme toggle temporarily disabled -->
            <!--
            <button
              id="theme-toggle"
              class="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-surface
                     hover:bg-accent-muted transition-colors"
              type="button"
              aria-label="Toggle dark mode"
              aria-pressed="${darkMode ? "true" : "false"}"
              title="Toggle theme"
            >
              <span class="font-mono text-xs track-md text-ink-3">THEME</span>
              <span class="font-mono text-xs text-ink-2">${darkMode ? "DARK" : "LIGHT"}</span>
            </button>
            -->

            <div class="relative">
              <a
                href="#/alerts"
                class="inline-flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-surface
                       hover:bg-primary-muted hover:text-primary transition-colors"
                aria-label="Alerts"
                title="Alerts"
              >
                <span class="opacity-70">◱</span>
                <span class="hidden sm:inline text-sm">Alerts</span>
              </a>
              <span
                class="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full text-xs font-mono
                       bg-danger text-parchment flex items-center justify-center"
                role="status"
                aria-live="polite"
                aria-label="Alert count"
              >
                ${alertCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  mountPersonaSwitcher(document.getElementById("persona-switcher"));

  // Theme toggle temporarily disabled.
  // const themeBtn = document.getElementById("theme-toggle");
  // themeBtn?.addEventListener("click", () => {
  //   const { darkMode: dm } = store.getState();
  //   store.setState({ darkMode: !dm });
  // });

  const sideBtn = document.getElementById("sidebar-toggle");
  sideBtn?.addEventListener("click", () => {
    const { sidebarOpen: open } = store.getState();
    store.setState({ sidebarOpen: !open });
  });
}

store.subscribe(render);
render();
