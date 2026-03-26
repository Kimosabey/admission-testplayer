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
  const base = "relative h-9 rounded-lg border text-sm font-mono transition-colors flex items-center justify-center";
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
    fullscreen: root.querySelector("#tp-fullscreen"),
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

  function isFullscreen() {
    return Boolean(document.fullscreenElement);
  }

  function syncFullscreenBtn() {
    if (!els.fullscreen) return;
    const on = isFullscreen();
    els.fullscreen.textContent = on ? "Exit full screen" : "Full screen";
    els.fullscreen.setAttribute("aria-pressed", on ? "true" : "false");
  }

  async function toggleFullscreen() {
    try {
      if (isFullscreen()) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else if (root.requestFullscreen) await root.requestFullscreen();
    } catch {
      // Browser may block without a user gesture.
    }

    syncFullscreenBtn();
  }

  els.fullscreen?.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", syncFullscreenBtn);
  window.addEventListener("hashchange", () => document.removeEventListener("fullscreenchange", syncFullscreenBtn), {
    once: true,
  });

  syncFullscreenBtn();

  // Best-effort: request full screen on entry (may be blocked).
  setTimeout(() => {
    if (!isFullscreen() && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, 0);


  const attemptKey = `atp_test_state_${sessionId}`;

  function selectQuestions(allQuestions, target = 25) {
    const desired = [
      ["MCQ", 10],
      ["MSQ", 5],
      ["NUM", 5],
      ["TF", 3],
      ["SA", 2],
    ];

    const picked = [];
    const seen = new Set();

    const takeByType = (type, n) => {
      const list = allQuestions.filter((q) => String(q?.type || "").toUpperCase() === type);
      for (let i = 0; i < list.length && n > 0 && picked.length < target; i += 1) {
        const q = list[i];
        if (!q?.id || seen.has(q.id)) continue;
        picked.push(q);
        seen.add(q.id);
        n -= 1;
      }
    };

    desired.forEach(([t, n]) => takeByType(t, n));

    for (let i = 0; i < allQuestions.length && picked.length < target; i += 1) {
      const q = allQuestions[i];
      if (!q?.id || seen.has(q.id)) continue;
      picked.push(q);
      seen.add(q.id);
    }

    return picked;
  }

  const allQuestions = await fetchData("questions");
  const qById = new Map((allQuestions || []).map((q) => [q.id, q]));

  const freshQuestionIds = selectQuestions(allQuestions || [], 25).map((q) => q.id);

  const baseAttempt = {
    idx: 0,
    answers: {},
    marked: [],
    questionIds: freshQuestionIds,
    startedAt: Date.now(),
    endAt: Date.now() + DURATION_SEC * 1000,
    submitted: false,
    submittedAt: null,
    submittedReason: null,
    savedAt: null,
  };

  const storedAttempt = safeParse(localStorage.getItem(attemptKey), null);
  let attempt = { ...baseAttempt, ...(storedAttempt || {}) };

  if (!attempt.questionIds || !Array.isArray(attempt.questionIds) || !attempt.questionIds.length) {
    attempt.questionIds = freshQuestionIds;
  }

  if (!attempt.startedAt) {
    attempt.startedAt = Date.now();
  }

  function questionForId(id) {
    const q = qById.get(id);
    if (q) return q;

    return {
      id,
      type: "MCQ",
      domain: "Question",
      subdomain: "",
      difficulty: "medium",
      bloomLevel: "",
      language: "English",
      exposureCount: 0,
      status: "published",
      body: "Question record missing from dataset.",
      options: [],
      answer: null,
      authorId: "",
      year: new Date().getFullYear(),
    };
  }

  let questions = attempt.questionIds.map(questionForId);

  attempt.idx = clamp(Number(attempt.idx) || 0, 0, Math.max(0, questions.length - 1));
  if (!attempt.endAt || attempt.endAt < Date.now()) attempt.endAt = Date.now() + DURATION_SEC * 1000;

  const timers = new Set();
  const qid = (i) => attempt.questionIds?.[i] || String(i + 1);

  function saveText() {
    if (!attempt.savedAt) {
      els.save.textContent = "Saved —";
      return;
    }
    const d = Math.max(0, Math.floor((Date.now() - attempt.savedAt) / 1000));
    els.save.textContent = d <= 1 ? "Saved just now" : `Saved ${d}s ago`;
  }

  function qType(q) {
    return String(q?.type || "MCQ").toUpperCase();
  }

  function isAnsweredValue(q, v) {
    if (v === null || v === undefined) return false;

    const t = qType(q);
    if (t === "MCQ" || t === "TF") return typeof v === "number";
    if (t === "MSQ") return Array.isArray(v) && v.length > 0;

    // NUM / SA / any free-response: treat empty-string as unanswered.
    return String(v).trim().length > 0;
  }

  function answeredForIndex(i) {
    const q = questions[i];
    const id = qid(i);
    const v = attempt.answers?.[id];
    return isAnsweredValue(q, v);
  }

  function answeredCount() {
    let n = 0;
    for (let i = 0; i < questions.length; i += 1) {
      if (answeredForIndex(i)) n += 1;
    }
    return n;
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
        const answered = answeredForIndex(i);

        return `<button type="button" data-jump="${i}" class="${paletteClass({ active, marked, answered })}">
          ${i + 1}
          ${marked ? '<span class="absolute -top-1 -right-1 text-xs leading-none">⚑</span>' : ""}
        </button>`;
      })
      .join("");

    els.pal.querySelectorAll("[data-jump]").forEach((b) => {
      b.addEventListener("click", () => {
        attempt.idx = Number(b.getAttribute("data-jump")) || 0;
        writeAttempt(attemptKey, attempt);
        render();
      });
    });
  }

  function finishAttempt(reason) {
    attempt.submitted = true;
    attempt.submittedAt = Date.now();
    attempt.submittedReason = reason;
    writeAttempt(attemptKey, attempt);
    closeModal();

    location.hash = `#/report/${encodeURIComponent(sessionId)}`;
  }

  function renderQuestion() {
    const q = questions[attempt.idx];
    if (!q) return;

    const id = qid(attempt.idx);
    const ms = markedSet();
    const selected = attempt.answers?.[id];
    const type = qType(q);
    let opts = Array.isArray(q.options) ? q.options : [];
    if (type === "TF" && !opts.length) opts = ["True", "False"];
    function setAnswer(val, { rerender = true } = {}) {
      attempt.answers = { ...attempt.answers, [id]: val };
      writeAttempt(attemptKey, attempt);

      if (rerender) render();
      else {
        syncCounts();
        renderPalette();
        saveText();
      }
    }

    let answerBlock = "";
    let footerNote = "";

    if ((type === "MCQ" || type === "MSQ" || type === "TF") && opts.length) {
      const selectedArr = Array.isArray(selected) ? selected : [];

      answerBlock = opts
        .map((t, i) => {
          const sel = type === "MCQ" || type === "TF" ? selected === i : selectedArr.includes(i);
          const letter = String.fromCharCode(65 + i);

          const indicator =
            type === "MCQ" || type === "TF"
              ? `<span class="mt-1.5 h-4 w-4 rounded-full border border-border flex items-center justify-center">
                   <span class="h-2 w-2 rounded-full ${sel ? "bg-primary" : "bg-transparent"}"></span>
                 </span>`
              : `<span class="mt-1.5 h-4 w-4 rounded border border-border flex items-center justify-center">
                   <span class="h-2 w-2 rounded-sm ${sel ? "bg-primary" : "bg-transparent"}"></span>
                 </span>`;

          return `
            <button type="button" data-opt="${i}" class="${optionClass(sel)}" aria-pressed="${sel}" ${
              attempt.submitted ? "disabled" : ""
            }>
              ${indicator}
              <span class="text-sm text-ink-2">
                <span class="font-mono text-xs text-ink-3">${letter}.</span> ${t}
              </span>
            </button>
          `;
        })
        .join("");

      footerNote = type === "MSQ" ? "Select all that apply." : "Options are deselectable: click a selected option again.";
    } else if (type === "NUM") {
      answerBlock = `
        <div class="rounded-2xl border border-border bg-surface-sunken px-5 py-5">
          <label class="block">
            <span class="font-mono text-xs uppercase track-md text-ink-3">Numeric response</span>
            <input
              id="tp-free"
              type="number"
              inputmode="decimal"
              class="mt-2 w-full h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink-2"
              placeholder="Enter a number"
              ${attempt.submitted ? "disabled" : ""}
            />
          </label>
          <p class="mt-3 text-xs text-ink-3 font-mono">Answer is auto-saved as you type.</p>
        </div>
      `;

      footerNote = "Numeric response.";
    } else {
      answerBlock = `
        <div class="rounded-2xl border border-border bg-surface-sunken px-5 py-5">
          <label class="block">
            <span class="font-mono text-xs uppercase track-md text-ink-3">Response</span>
            <textarea
              id="tp-free"
              rows="4"
              class="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 text-sm text-ink-2"
              placeholder="Type your answer"
              ${attempt.submitted ? "disabled" : ""}
            ></textarea>
          </label>
          <p class="mt-3 text-xs text-ink-3 font-mono">Answer is auto-saved as you type.</p>
        </div>
      `;

      footerNote = "Free response.";
    }

    els.q.innerHTML = `
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="font-mono text-xs text-ink-3">Q${attempt.idx + 1} · ${id}</p>

          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center rounded-full border border-border bg-surface-sunken px-2.5 py-1 text-xs font-mono text-ink-3">${type}</span>
            ${q.difficulty ? '<span class="text-xs text-ink-3">' + q.difficulty + "</span>" : ""}
          </div>

          <h2 class="mt-3 font-display text-3xl text-primary">${q.domain || "Question"}</h2>
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

      <div class="mt-6 grid gap-3" aria-label="Answer area">
        ${answerBlock || `<div class="rounded-2xl border border-border bg-surface-sunken px-5 py-5"><p class="text-sm text-ink-2">No response UI available.</p></div>`}
      </div>

      <div class="mt-8 flex items-center justify-between gap-3">
        <button
          id="tp-prev"
          type="button"
          class="h-10 px-4 rounded-xl border border-border bg-surface hover:bg-primary-muted hover:text-primary transition-colors"
          ${attempt.idx === 0 ? "disabled" : ""}
        >
          Prev
        </button>

        <button
          id="tp-next"
          type="button"
          class="h-10 px-4 rounded-xl border border-border bg-surface hover:bg-primary-muted hover:text-primary transition-colors"
          ${attempt.idx === questions.length - 1 ? "disabled" : ""}
        >
          Next
        </button>
      </div>

      <p class="mt-6 text-xs text-ink-3 font-mono">${footerNote}</p>
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
      setAnswer(null);
    });

    if (type === "MCQ" || type === "TF") {
      els.q.querySelectorAll("[data-opt]").forEach((b) => {
        b.addEventListener("click", () => {
          if (attempt.submitted) return;
          const i = Number(b.getAttribute("data-opt"));
          const next = selected === i ? null : i;
          setAnswer(next);
        });
      });
    }

    if (type === "MSQ") {
      const selectedArr = Array.isArray(selected) ? selected : [];
      els.q.querySelectorAll("[data-opt]").forEach((b) => {
        b.addEventListener("click", () => {
          if (attempt.submitted) return;
          const i = Number(b.getAttribute("data-opt"));
          const next = new Set(selectedArr);
          if (next.has(i)) next.delete(i);
          else next.add(i);

          const val = next.size ? Array.from(next).sort((a, b) => a - b) : null;
          setAnswer(val);
        });
      });
    }

    if (!(type === "MCQ" || type === "MSQ")) {
      const input = els.q.querySelector("#tp-free");
      if (input) {
        const current = selected === null || selected === undefined ? "" : String(selected);
        input.value = current;

        input.addEventListener("input", () => {
          if (attempt.submitted) return;
          window.clearTimeout(input.__t);
          input.__t = window.setTimeout(() => {
            const v = String(input.value || "").trim();
            setAnswer(v ? v : null, { rerender: false });
          }, 120);
        });
      }
    }

    els.q.querySelector("#tp-prev")?.addEventListener("click", () => {
      if (attempt.idx === 0) return;
      attempt.idx -= 1;
      writeAttempt(attemptKey, attempt);
      render();
    });

    els.q.querySelector("#tp-next")?.addEventListener("click", () => {
      if (attempt.idx >= questions.length - 1) return;
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
    }

    renderQuestion();

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

    const nextQuestionIds = selectQuestions(allQuestions || [], 25).map((q) => q.id);
    attempt = {
      ...baseAttempt,
      idx: 0,
      answers: {},
      marked: [],
      questionIds: nextQuestionIds,
      startedAt: Date.now(),
      endAt: Date.now() + DURATION_SEC * 1000,
      submitted: false,
      submittedAt: null,
      submittedReason: null,
    };
    questions = attempt.questionIds.map(questionForId);

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
