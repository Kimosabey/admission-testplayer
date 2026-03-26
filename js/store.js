const STORAGE_KEYS = {
  theme: "atp_theme",
  persona: "atp_persona",
};

function readStoredTheme() {
  const v = localStorage.getItem(STORAGE_KEYS.theme);
  if (v === "dark") return true;
  if (v === "light") return false;
  return false;
}

function readStoredPersona() {
  return localStorage.getItem(STORAGE_KEYS.persona) || "candidate";
}

function applyTheme(darkMode) {
  document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
}

const _state = {
  persona: "candidate",
  candidateId: "APP-2024-00001",
  activeSessionId: null,
  sidebarOpen: true,
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

    Object.assign(_state, patch);

    if (themeChanged) {
      localStorage.setItem(STORAGE_KEYS.theme, _state.darkMode ? "dark" : "light");
      applyTheme(_state.darkMode);
    }

    if (personaChanged) {
      localStorage.setItem(STORAGE_KEYS.persona, _state.persona);
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

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    _state.sidebarOpen = !isMobile;
  } catch {
    _state.darkMode = false;
    _state.persona = "candidate";
    _state.sidebarOpen = true;
  }

  applyTheme(_state.darkMode);
})();
