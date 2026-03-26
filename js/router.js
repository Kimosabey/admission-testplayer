const ROUTES = {
  "/": "/pages/candidate/dashboard.html",
  "/dashboard": "/pages/candidate/dashboard.html",
  "/booking": "/pages/candidate/booking.html",
  "/hall-ticket": "/pages/candidate/hall-ticket.html",
  "/hall-ticket/:id": "/pages/candidate/hall-ticket.html",

  "/roster": "/pages/admin/roster.html",
  "/centers": "/pages/admin/centers.html",
  "/calendar": "/pages/admin/calendar.html",

  "/items": "/pages/qbms/items.html",
  "/items/:id": "/pages/qbms/item-detail.html",
  "/blueprints": "/pages/qbms/blueprints.html",

  "/test-packs": "/pages/exam-ops/test-packs.html",
  "/assembly": "/pages/exam-ops/assembly.html",

  "/check-in": "/pages/proctor/check-in.html",
  "/monitor": "/pages/proctor/monitor.html",

  "/noc": "/pages/noc/dashboard.html",
  "/alerts": "/pages/noc/alerts.html",

  "/results": "/pages/scoring/results.html",
  "/export": "/pages/scoring/export.html",

  "/report": "/pages/candidate/report.html",
  "/report/:sessionId": "/pages/candidate/report.html",

  "/session/:sessionId": "/pages/test-player/session.html",
};

export const PERSONA_ROUTES = {
  candidate: [
    { path: "/dashboard", label: "My Dashboard", icon: "◈" },
    { path: "/booking", label: "Book a Slot", icon: "◉" },
    { path: "/hall-ticket", label: "Hall Ticket", icon: "◧" },
    { path: "/report", label: "Report", icon: "◪" },
  ],
  callCenter: [{ path: "/roster", label: "Candidate Roster", icon: "◫" }],
  admissionsAdmin: [
    { path: "/roster", label: "Roster", icon: "◫" },
    { path: "/centers", label: "Centers", icon: "◎" },
    { path: "/calendar", label: "Calendar", icon: "◰" },
    { path: "/noc", label: "NOC Dashboard", icon: "◰" },
    { path: "/alerts", label: "Alerts", icon: "◱" },
    { path: "/results", label: "Results", icon: "◫" },
    { path: "/export", label: "CRM Export", icon: "◎" },
  ],
  centerAdmin: [
    { path: "/centers", label: "My Center", icon: "◎" },
    { path: "/check-in", label: "Check-in", icon: "◱" },
    { path: "/monitor", label: "Monitor", icon: "◲" },
  ],
  proctor: [
    { path: "/check-in", label: "Check-in", icon: "◱" },
    { path: "/monitor", label: "Monitor", icon: "◲" },
  ],
  itemAuthor: [{ path: "/items", label: "Questions", icon: "◳" }],
  examOps: [
    { path: "/items", label: "Questions", icon: "◳" },
    { path: "/blueprints", label: "Blueprints", icon: "◈" },
    { path: "/test-packs", label: "Test Packs", icon: "◉" },
    { path: "/assembly", label: "Assembly", icon: "◧" },
  ],
  scoreAnalyst: [
    { path: "/results", label: "Results", icon: "◫" },
    { path: "/export", label: "CRM Export", icon: "◎" },
  ],
  superAdmin: [
    { path: "/dashboard", label: "Dashboard", icon: "◈" },
    { path: "/roster", label: "Roster", icon: "◫" },
    { path: "/centers", label: "Centers", icon: "◎" },
    { path: "/items", label: "Questions", icon: "◳" },
    { path: "/blueprints", label: "Blueprints", icon: "◉" },
    { path: "/test-packs", label: "Test Packs", icon: "◧" },
    { path: "/noc", label: "NOC", icon: "◰" },
    { path: "/results", label: "Results", icon: "◱" },
    { path: "/export", label: "Export", icon: "◲" },
  ],
};

function normaliseHash(hash) {
  const raw = (hash || "").replace(/^#/, "").trim();
  return raw || "/";
}

function splitPath(path) {
  return path.replace(/\/+$/, "").split("/").filter(Boolean);
}

function matchPattern(path, pattern) {
  const pathParts = splitPath(path);
  const patParts = splitPath(pattern);

  if (pathParts.length !== patParts.length) return null;

  const params = {};
  for (let i = 0; i < patParts.length; i += 1) {
    const p = patParts[i];
    const v = pathParts[i];

    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(v);
      continue;
    }

    if (p !== v) return null;
  }

  return params;
}

function resolveRoute(path) {
  for (const pattern of Object.keys(ROUTES)) {
    const params = matchPattern(path, pattern);
    if (params) return { path, pattern, params, file: ROUTES[pattern] };
  }
  return { path, pattern: null, params: {}, file: null };
}


function setChromeMode(mode) {
  document.documentElement.setAttribute("data-chrome", mode);
}

function isTestPlayerRoute(match) {
  if (match?.pattern?.startsWith("/session")) return true;
  if (match?.file?.includes("/pages/test-player/")) return true;
  return false;
}

async function navigate(hash) {
  const path = normaliseHash(hash);

  if (window.ScrollTrigger?.getAll) {
    window.ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  const match = resolveRoute(path);
  const file = match.file ?? ROUTES["/"];
  const testPlayer = isTestPlayerRoute({ ...match, file });

  setChromeMode(testPlayer ? "hidden" : "shell");
  if (testPlayer) window.__lenis?.stop();
  else window.__lenis?.start();

  window.__route = { ...match, file, testPlayer };

  const app = document.getElementById("app");
  if (!app) return;

  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Failed to load ${file}`);
    const html = await res.text();

    app.innerHTML = html;

    const script = app.querySelector("script[data-page-init]");
    if (script && script.textContent.trim()) {
      const fn = new Function(script.textContent);
      fn();
    }
  } catch (err) {
    app.innerHTML = `
      <div class="p-8 max-w-3xl mx-auto" data-page="error">
        <h1 class="font-display text-4xl text-primary">Route failed to load</h1>
        <p class="mt-3 text-ink-2">${String(err.message || err)}</p>
        <a href="#/" class="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface hover:bg-primary-muted hover:text-primary transition-colors">
          <span class="opacity-70">◈</span>
          Back to dashboard
        </a>
      </div>
    `;
  }
}

window.addEventListener("hashchange", () => navigate(location.hash));
navigate(location.hash);
