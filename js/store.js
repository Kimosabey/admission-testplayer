const STORAGE_KEYS = {
  theme: "atp_theme",
  persona: "atp_persona",
  center: "atp_center_id",
  sidebarCollapsed: "atp_sidebar_collapsed",
};

function readStoredTheme() {
  const v = localStorage.getItem(STORAGE_KEYS.theme);
  if (v === "dark") return true;
  if (v === "light") return false;
  return false;
}

function normalisePersona(key) {
  if (key === "bookingAdmin" || key === "noc") return "admissionsAdmin";
  if (key === "proctor") return "centerAdmin";
  if (key === "examOps") return "examOps";
  if (key === "callCenter") return "callCenter";
  if (key === "centerAdmin") return "centerAdmin";
  if (key === "itemAuthor") return "itemAuthor";
  if (key === "scoreAnalyst") return "scoreAnalyst";
  if (key === "superAdmin") return "superAdmin";
  if (key === "admissionsAdmin") return "admissionsAdmin";
  return "candidate";
}

function readStoredPersona() {
  const raw = localStorage.getItem(STORAGE_KEYS.persona) || "candidate";
  return normalisePersona(raw);
}

function readStoredCenterId() {
  return localStorage.getItem(STORAGE_KEYS.center) || null;
}

function readStoredSidebarCollapsed() {
  return localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === "true";
}

function applyTheme(darkMode) {
  document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
}

const _state = {
  persona: "candidate",
  candidateId: "APP-2024-00001",
  activeSessionId: null,
  activeCenterId: null,
  sidebarOpen: true,
  sidebarCollapsed: false,
  alertCount: 0,
  darkMode: false,
};

const _listeners = new Set();

export const store = {
  getState: () => ({ ..._state }),

  setState: (patch) => {
    if (!patch || typeof patch !== "object") return;

    const next = { ..._state, ...patch };
    const themeChanged = next.darkMode !== _state.darkMode;
    const personaChanged = next.persona !== _state.persona;
    const centerChanged = next.activeCenterId !== _state.activeCenterId;
    const sidebarCollapsedChanged = next.sidebarCollapsed !== _state.sidebarCollapsed;

    Object.assign(_state, patch);

    if (themeChanged) {
      localStorage.setItem(STORAGE_KEYS.theme, _state.darkMode ? "dark" : "light");
      applyTheme(_state.darkMode);
    }

    if (personaChanged) {
      localStorage.setItem(STORAGE_KEYS.persona, _state.persona);
    }

    if (centerChanged) {
      if (_state.activeCenterId) localStorage.setItem(STORAGE_KEYS.center, _state.activeCenterId);
      else localStorage.removeItem(STORAGE_KEYS.center);
    }

    if (sidebarCollapsedChanged) {
      localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, _state.sidebarCollapsed ? "true" : "false");
    }

    _listeners.forEach((fn) => fn(_state));
  },

  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};

(function initFromStorage() {
  try {
    _state.darkMode = readStoredTheme();
    _state.persona = readStoredPersona();

    _state.activeCenterId = readStoredCenterId();


    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    _state.sidebarOpen = !isMobile;

    _state.sidebarCollapsed = readStoredSidebarCollapsed();

  } catch {
    _state.darkMode = false;
    _state.persona = "candidate";
    _state.activeCenterId = null;
    _state.sidebarOpen = true;
    _state.sidebarCollapsed = false;
  }

  applyTheme(_state.darkMode);
})();
