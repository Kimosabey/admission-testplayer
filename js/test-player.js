import { fetchData } from "/js/utils.js";
import { store } from "/js/store.js";

const DURATION_SEC = 60 * 60;
const TICK_MS = 250;

function safeParse(raw, fallback) {
  try {
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function timeText(sec) {
  const t = Math.max(0, sec);
  const hh = Math.floor(t / 3600);
  const mm = Math.floor((t % 3600) / 60);
  const ss = Math.floor(t % 60);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function applyTimerStyle(el, sec) {
  el.classList.remove(
    "bg-warning-muted",
    "text-warning",
    "border-warning",
    "bg-danger-muted",
    "text-danger",
    "border-danger",
  );

  if (sec <= 5 * 60) el.classList.add("bg-danger-muted", "text-danger", "border-danger");
  else if (sec <= 10 * 60) el.classList.add("bg-warning-muted", "text-warning", "border-warning");
}

function paletteClass({ active, marked, answered }) {
  const base = "h-9 rounded-lg border text-sm font-mono transition-colors";
  if (active) return `${base} border-accent bg-accent-muted text-warning`;
  if (marked) return `${base} border-accent bg-accent-muted text-warning hover:bg-accent-muted`;
  if (answered) return `${base} border-primary bg-primary-muted text-primary hover:bg-primary-muted`;
  return `${base} border-border bg-surface text-ink-2 hover:bg-primary-muted hover:text-primary`;
}

function optionClass(selected) {
  const base = "w-full text-left rounded-2xl border px-4 py-4 transition-colors flex items-start gap-3";
  return selected
    ? `${base} border-primary bg-primary-muted`
    : `${base} border-border bg-surface hover:bg-primary-muted`;
}

function writeAttempt(key, attempt) {
  attempt.savedAt = Date.now();
  try {
    localStorage.setItem(key, JSON.stringify(attempt));
  } catch {
    // ignore
  }
}

export async function mountTestPlayer() {
  const root = document.querySelector('[data-page="test-player"]');
  if (!root) return;

  window.__lenis?.stop();

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const cleanup = () => {
    window.__lenis?.start();
    document.body.style.overflow = prevOverflow;
  };

  window.addEventListener("hashchange", cleanup, { once: true });

  const els = {
    session: root.querySelector("#tp-session"),
    save: root.querySelector("#tp-save"),
    timer: root.querySelector("#tp-timer"),
    answered: root.querySelector("#tp-answered"),
    marked: root.querySelector("#tp-marked"),
    total: root.querySelector("#tp-total"),
    reset: root.querySelector("#tp-reset"),
    pal: root.querySelector("#tp-pal"),
    q: root.querySelector("#tp-q"),
    submit: root.querySelector("#tp-submit-open"),

    ov: root.querySelector("#tp-overlay"),
    modal: root.querySelector("#tp-modal"),
    card: root.querySelector("#tp-modal-card"),
    ma: root.querySelector("#tp-ma"),
    mu: root.querySelector("#tp-mu"),
    mm: root.querySelector("#tp-mm"),
    mnote: root.querySelector("#tp-mnote"),
    mclose: root.querySelector("#tp-modal-close"),
    mcancel: root.querySelector("#tp-modal-cancel"),
    mconfirm: root.querySelector("#tp-modal-confirm"),
  };

  const sessionId = window.__route?.params?.sessionId || store.getState().activeSessionId || "SES-DEMO";
  store.setState({ activeSessionId: sessionId });
  els.session.textContent = sessionId;

  const attemptKey = `atp_test_state_${sessionId}`;
  const questions = (await fetchData("questions")).slice(0, 25);

  const baseAttempt = {
    idx: 0,
    answers: {},
    marked: [],
    endAt: Date.now() + DURATION_SEC * 1000,
    submitted: false,
    savedAt: null,
  };

  let attempt = { ...baseAttempt, ...safeParse(localStorage.getItem(attemptKey), {}) };

  attempt.idx = clamp(Number(attempt.idx) || 0, 0, Math.max(0, questions.length - 1));
  if (!attempt.endAt || attempt.endAt < Date.now()) attempt.endAt = Date.now() + DURATION_SEC * 1000;

  const timers = new Set();
  const qid = (i) => questions[i]?.id || String(i + 1);

  function saveText() {
    if (!attempt.savedAt) {
      els.save.textContent = "Saved —";
      return;
    }
    const d = Math.max(0, Math.floor((Date.now() - attempt.savedAt) / 1000));
    els.save.textContent = d <= 1 ? "Saved just now" : `Saved ${d}s ago`;
  }

  function answeredCount() {
    return Object.values(attempt.answers || {}).filter((v) => v !== null && v !== undefined).length;
  }

  function markedSet() {
    return new Set(Array.isArray(attempt.marked) ? attempt.marked : []);
  }

  function syncCounts() {
    els.total.textContent = String(questions.length);
    els.answered.textContent = String(answeredCount());
    els.marked.textContent = String(Array.isArray(attempt.marked) ? attempt.marked.length : 0);
  }

  function openModal(note) {
    const a = answeredCount();
    const total = questions.length;
    const m = Array.isArray(attempt.marked) ? attempt.marked.length : 0;

    els.ma.textContent = `${a} / ${total}`;
    els.mu.textContent = `${Math.max(0, total - a)} / ${total}`;
    els.mm.textContent = `${m}`;
    els.mnote.textContent = note;

    els.ov.classList.remove("pointer-events-none");
    els.ov.classList.add("opacity-100");

    els.modal.classList.remove("pointer-events-none");
    els.card.classList.remove("opacity-0", "translate-y-4");
    els.card.classList.add("opacity-100", "translate-y-0");
  }

  function closeModal() {
    els.ov.classList.add("pointer-events-none");
    els.ov.classList.remove("opacity-100");

    els.modal.classList.add("pointer-events-none");
    els.card.classList.add("opacity-0", "translate-y-4");
    els.card.classList.remove("opacity-100", "translate-y-0");
  }

  function renderPalette() {
    const ms = markedSet();

    els.pal.innerHTML = questions
      .map((_, i) => {
        const id = qid(i);
        const active = i === attempt.idx;
        const marked = ms.has(id);
        const answered = attempt.answers?.[id] !== null && attempt.answers?.[id] !== undefined;

        return `<button type="button" data-jump="${i}" class="${paletteClass({ active, marked, answered })}" ${
          attempt.submitted ? "disabled" : ""
        }>${i + 1}</button>`;
      })
      .join("");

    els.pal.querySelectorAll("[data-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        if (attempt.submitted) return;
        attempt.idx = Number(b.getAttribute("data-jump")) || 0;
        writeAttempt(attemptKey, attempt);
        render();
      });
    });
  }

  function finishAttempt(reason) {
    attempt.submitted = true;
    writeAttempt(attemptKey, attempt);
    closeModal();

    renderPalette();
    syncCounts();

    els.q.innerHTML = `
      <p class="font-mono text-xs uppercase track-xl text-ink-3">Attempt submitted</p>
      <h2 class="mt-2 font-display text-4xl text-primary">Submission complete</h2>
      <p class="mt-3 text-ink-2">${reason}</p>

      <div class="mt-6 grid gap-3 sm:grid-cols-3">
        <div class="rounded-2xl border border-border bg-surface-sunken px-5 py-4">
          <p class="font-mono text-xs uppercase track-md text-ink-3">Answered</p>
          <p class="mt-2 font-mono text-sm text-ink-2">${answeredCount()} / ${questions.length}</p>
        </div>
        <div class="rounded-2xl border border-border bg-surface-sunken px-5 py-4">
          <p class="font-mono text-xs uppercase track-md text-ink-3">Marked</p>
          <p class="mt-2 font-mono text-sm text-ink-2">${Array.isArray(attempt.marked) ? attempt.marked.length : 0}</p>
        </div>
        <div class="rounded-2xl border border-border bg-surface-sunken px-5 py-4">
          <p class="font-mono text-xs uppercase track-md text-ink-3">Time</p>
          <p class="mt-2 font-mono text-sm text-ink-2">${els.timer.textContent}</p>
        </div>
      </div>

      <a
        href="#/dashboard"
        class="mt-6 inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-primary hover:bg-primary-light transition-colors"
        style="color: var(--color-text-inverse);"
      >
        Exit
      </a>
    `;
  }

  function renderQuestion() {
    const q = questions[attempt.idx];
    if (!q) return;

    const id = qid(attempt.idx);
    const ms = markedSet();
    const selected = attempt.answers?.[id];
    const opts = Array.isArray(q.options) ? q.options : [];

    els.q.innerHTML = `
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="font-mono text-xs text-ink-3">Q${attempt.idx + 1} · ${id}</p>
          <h2 class="mt-2 font-display text-3xl text-primary">${q.domain || "Question"}</h2>
          <p class="mt-2 text-sm text-ink-2">${q.body || ""}</p>
        </div>

        <div class="flex items-center gap-3">
          <button
            id="tp-mark"
            type="button"
            class="h-10 px-4 rounded-xl border border-border bg-surface hover:bg-accent-muted hover:text-warning transition-colors"
            ${attempt.submitted ? "disabled" : ""}
          >
            ${ms.has(id) ? "Unmark" : "Mark for review"}
          </button>

          <button
            id="tp-clear"
            type="button"
            class="h-10 px-4 rounded-xl border border-border bg-surface hover:bg-primary-muted hover:text-primary transition-colors"
            ${attempt.submitted ? "disabled" : ""}
          >
            Clear
          </button>
        </div>
      </div>

      <div class="mt-6 grid gap-3" aria-label="Answer options">
        ${
          opts.length
            ? opts
                .map((t, i) => {
                  const sel = selected === i;
                  const letter = String.fromCharCode(65 + i);
                  return `
                    <button type="button" data-opt="${i}" class="${optionClass(sel)}" aria-pressed="${sel}" ${
                      attempt.submitted ? "disabled" : ""
                    }>
                      <span class="mt-1.5 h-4 w-4 rounded-full border border-border flex items-center justify-center">
                        <span class="h-2 w-2 rounded-full ${sel ? "bg-primary" : "bg-transparent"}"></span>
                      </span>
                      <span class="text-sm text-ink-2">
                        <span class="font-mono text-xs text-ink-3">${letter}.</span> ${t}
                      </span>
                    </button>
                  `;
                })
                .join("")
            : `<div class="rounded-2xl border border-border bg-surface-sunken px-5 py-5"><p class="text-sm text-ink-2">No options in demo dataset.</p></div>`
        }
      </div>

      <div class="mt-8 flex items-center justify-between gap-3">
        <button
          id="tp-prev"
          type="button"
          class="h-10 px-4 rounded-xl border border-border bg-surface hover:bg-primary-muted hover:text-primary transition-colors"
          ${attempt.idx === 0 || attempt.submitted ? "disabled" : ""}
        >
          Prev
        </button>

        <button
          id="tp-next"
          type="button"
          class="h-10 px-4 rounded-xl border border-border bg-surface hover:bg-primary-muted hover:text-primary transition-colors"
          ${attempt.idx === questions.length - 1 || attempt.submitted ? "disabled" : ""}
        >
          Next
        </button>
      </div>

      <p class="mt-6 text-xs text-ink-3 font-mono">Options are deselectable: click a selected option again.</p>
    `;

    els.q.querySelector("#tp-mark")?.addEventListener("click", () => {
      if (attempt.submitted) return;
      const next = new Set(attempt.marked);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      attempt.marked = Array.from(next);
      writeAttempt(attemptKey, attempt);
      render();
    });

    els.q.querySelector("#tp-clear")?.addEventListener("click", () => {
      if (attempt.submitted) return;
      attempt.answers = { ...attempt.answers, [id]: null };
      writeAttempt(attemptKey, attempt);
      render();
    });

    els.q.querySelectorAll("[data-opt]").forEach((b) => {
      b.addEventListener("click", () => {
        if (attempt.submitted) return;
        const i = Number(b.getAttribute("data-opt"));
        const next = selected === i ? null : i;
        attempt.answers = { ...attempt.answers, [id]: next };
        writeAttempt(attemptKey, attempt);
        render();
      });
    });

    els.q.querySelector("#tp-prev")?.addEventListener("click", () => {
      if (attempt.submitted || attempt.idx === 0) return;
      attempt.idx -= 1;
      writeAttempt(attemptKey, attempt);
      render();
    });

    els.q.querySelector("#tp-next")?.addEventListener("click", () => {
      if (attempt.submitted || attempt.idx >= questions.length - 1) return;
      attempt.idx += 1;
      writeAttempt(attemptKey, attempt);
      render();
    });
  }

  function render() {
    syncCounts();
    renderPalette();

    if (attempt.submitted) {
      els.submit.disabled = true;
      els.submit.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      els.submit.disabled = false;
      els.submit.classList.remove("opacity-50", "cursor-not-allowed");
      renderQuestion();
    }

    saveText();
  }

  function tick() {
    const rem = Math.max(0, Math.ceil((attempt.endAt - Date.now()) / 1000));
    els.timer.textContent = timeText(rem);
    applyTimerStyle(els.timer, rem);
    saveText();

    if (!attempt.submitted && rem <= 0) {
      finishAttempt("Time ended. Auto-submitted at 00:00.");
    }
  }

  els.submit.addEventListener("click", () => {
    if (attempt.submitted) return;
    openModal("Confirm submission to end the attempt.");
  });

  [els.mclose, els.mcancel, els.ov].forEach((x) => {
    x.addEventListener("click", closeModal);
  });

  els.mconfirm.addEventListener("click", () => {
    if (attempt.submitted) return;
    finishAttempt("Submitted by candidate.");
  });

  els.reset.addEventListener("click", () => {
    localStorage.removeItem(attemptKey);
    attempt = { ...baseAttempt, endAt: Date.now() + DURATION_SEC * 1000 };
    writeAttempt(attemptKey, attempt);
    render();
  });

  writeAttempt(attemptKey, attempt);
  render();

  tick();
  const intervalId = setInterval(tick, TICK_MS);
  timers.add(intervalId);

  window.addEventListener(
    "hashchange",
    () => {
      timers.forEach((t) => clearInterval(t));
      timers.clear();
    },
    { once: true },
  );
}
