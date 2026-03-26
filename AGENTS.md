# AGENTS.md — Admission Test Platform

> **Read this file before touching any code.**
> This is the canonical reference for all AI agents, developers, and contributors working on this codebase. It covers the full product scope, technical stack, aesthetic system, scroll constraints, data contracts, file structure, and week-by-week task breakdown. When in doubt, consult this file first.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [CDN Registry](#3-cdn-registry)
4. [Project Structure](#4-project-structure)
5. [Aesthetic System](#5-aesthetic-system)
6. [Scroll Stack — Mandatory Rules](#6-scroll-stack--mandatory-rules)
7. [Data Layer](#7-data-layer)
8. [Page Architecture & Routing](#8-page-architecture--routing)
9. [Module Inventory](#9-module-inventory)
10. [Component Conventions](#10-component-conventions)
11. [Persona System](#11-persona-system)
12. [State Management](#12-state-management)
13. [Week-by-Week Task Breakdown](#13-week-by-week-task-breakdown)
14. [Hard Constraints — Never Violate](#14-hard-constraints--never-violate)

---

## 1. Project Overview

### What This Is

A full-featured **Admission Test Platform** built entirely in vanilla HTML, CSS, and JavaScript with Tailwind CSS (CDN), GSAP, and Lenis via CDN. No build step. No framework. No backend. All data is served from static JSON files fetched at runtime via `fetch()`.

The platform covers the complete lifecycle of high-stakes university entrance exams:

- Candidate booking and hall-ticket generation
- Question bank authoring, review, and lifecycle management
- Test assembly via blueprints and JIT (Just-In-Time) pack delivery simulation
- Secure test-taking with lockdown simulation and proctoring UI
- Score computation and CRM export simulation
- Live NOC (Network Operations Center) monitoring dashboard

### What This Is Not

- Not a backend system. No server. No database.
- Not a real lockdown browser. The test player simulates lockdown UX only.
- Not connected to Salesforce. CRM sync is a mock UI flow.
- No build step — everything runs from the file system or a simple static server (`npx serve .`).

### Primary Users (10 Personas)

| Persona Key    | Label             | Primary Concern                                       |
| -------------- | ----------------- | ----------------------------------------------------- |
| `candidate`    | Candidate         | Books slot, downloads hall-ticket, takes test         |
| `callCenter`   | Call Center Agent | Handles reschedule requests                           |
| `bookingAdmin` | Booking Admin     | Manages rosters, calendar, center capacity            |
| `centerAdmin`  | Center Admin      | Prepares sessions, allocates seats                    |
| `proctor`      | Proctor           | Manages check-in, monitors room, logs incidents       |
| `itemAuthor`   | Item Author       | Creates and submits questions to QBMS                 |
| `examOps`      | Exam Ops          | Assembles tests, manages blueprints, dispatches packs |
| `scoreAnalyst` | Score Analyst     | Reviews scores, runs QC, exports to CRM               |
| `noc`          | NOC               | Live monitoring of all centers and sessions           |
| `superAdmin`   | Super Admin       | RBAC, global config, governance                       |

---

## 2. Tech Stack

| Concern        | Technology                                 | Notes                                              |
| -------------- | ------------------------------------------ | -------------------------------------------------- |
| **Markup**     | HTML5                                      | Semantic, accessible elements throughout           |
| **Styling**    | Tailwind CSS (CDN) + CSS custom properties | Tailwind for utilities; CSS vars for design tokens |
| **Scripting**  | Vanilla JavaScript (ES2022+)               | Modules via `type="module"` in `<script>` tags     |
| **Scroll**     | Lenis (CDN)                                | Owns all scroll behavior                           |
| **Animations** | GSAP + ScrollTrigger (CDN)                 | All scroll-linked animations                       |
| **Charts**     | Chart.js (CDN)                             | All data visualisations                            |
| **Tables**     | Vanilla JS + CSS                           | Hand-rolled sortable/filterable tables             |
| **QR Codes**   | QRCode.js (CDN)                            | Hall-ticket QR generation                          |
| **Data**       | Static JSON files                          | Fetched via `fetch()` on page load                 |
| **Routing**    | Hash-based SPA router                      | `#/booking`, `#/hall-ticket/APP-001`, etc.         |
| **State**      | Plain JS module (singleton store)          | No framework state library needed                  |
| **Fonts**      | Google Fonts (CDN)                         | Cormorant Garamond + DM Sans + JetBrains Mono      |

### Why No Framework

- Zero build tooling — open any HTML file in a browser and it works
- CDN-only dependencies — no `npm install`
- Agents can write and preview individual page files independently
- Easier to iterate page by page without breaking a shared bundle

---

## 3. CDN Registry

All external resources load from these CDN links. Never add new CDN sources without updating this list.

```html
<!-- ═══════════════════════════════════════════════ -->
<!--  PASTE THIS BLOCK in every HTML file's <head>  -->
<!-- ═══════════════════════════════════════════════ -->

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>

<!-- Tailwind CSS (CDN — utility classes only, no purge) -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- GSAP + ScrollTrigger -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Lenis (smooth scroll) -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>

<!-- QRCode.js -->
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>

<!-- Shared stylesheets -->
<link rel="stylesheet" href="/styles/tokens.css" />
<link rel="stylesheet" href="/styles/typography.css" />
<link rel="stylesheet" href="/styles/components.css" />

<!-- Tailwind config (extends default with custom tokens) -->
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: "#0A3D1F",
          "primary-light": "#1A6B38",
          "primary-muted": "#E8F0EA",
          accent: "#C8A84B",
          "accent-muted": "#F5EDD6",
          parchment: "#F5F2EB",
          surface: "#FFFFFF",
          "surface-raised": "#FDFCF9",
          "surface-sunken": "#EDE9DF",
          ink: "#1A1A18",
          "ink-2": "#4A4A45",
          "ink-3": "#7A7A73",
          border: "#D8D4C8",
          "border-strong": "#B8B4A8",
          danger: "#C0392B",
          "danger-muted": "#FDECEA",
          success: "#1A6B38",
          "success-muted": "#E8F0EA",
          warning: "#D4850A",
          "warning-muted": "#FDF3DC",
          info: "#1B5E93",
          "info-muted": "#E6F0FA",
        },
        fontFamily: {
          display: ['"Cormorant Garamond"', "Georgia", "serif"],
          body: ['"DM Sans"', "system-ui", "sans-serif"],
          mono: ['"JetBrains Mono"', "monospace"],
        },
      },
    },
  };
</script>
```

### Tailwind CDN Limitation Note

The CDN build does **not** purge unused classes — it generates all utilities on the fly via a JavaScript shim. This is acceptable for a demo/prototype. For production, swap to a build-step Tailwind config. Do not use arbitrary values like `bg-[#abc]` — use the extended color tokens defined above instead.

---

## 4. Project Structure

```
admission-platform/
│
├── index.html                    ← SPA shell: loads router, renders pages into #app
│
├── pages/
│   ├── candidate/
│   │   ├── booking.html
│   │   ├── hall-ticket.html
│   │   └── dashboard.html
│   ├── admin/
│   │   ├── roster.html
│   │   ├── centers.html
│   │   └── calendar.html
│   ├── qbms/
│   │   ├── items.html
│   │   ├── item-detail.html
│   │   └── blueprints.html
│   ├── exam-ops/
│   │   ├── test-packs.html
│   │   └── assembly.html
│   ├── proctor/
│   │   ├── check-in.html
│   │   └── monitor.html
│   ├── noc/
│   │   ├── dashboard.html
│   │   └── alerts.html
│   ├── scoring/
│   │   ├── results.html
│   │   └── export.html
│   └── test-player/
│       └── session.html
│
├── components/
│   ├── navbar.js                 ← Top bar HTML + logic (injected via innerHTML)
│   ├── sidebar.js                ← Persona-aware sidebar (injected)
│   ├── persona-switcher.js       ← Role dropdown
│   ├── status-pill.js            ← StatusPill factory function
│   ├── badge.js                  ← Badge factory function
│   ├── data-table.js             ← Sortable table builder
│   ├── count-up.js               ← GSAP count-up component
│   ├── hash-display.js           ← Monospaced hash with copy
│   └── qr-block.js               ← QRCode.js wrapper
│
├── js/
│   ├── router.js                 ← Hash-based SPA router
│   ├── store.js                  ← Singleton state module
│   ├── scroll.js                 ← Canonical Lenis + GSAP boilerplate
│   ├── utils.js                  ← Shared utilities (dates, formatting, etc.)
│   └── score-calculator.js       ← Scoring logic
│
├── data/
│   ├── candidates.json
│   ├── centers.json
│   ├── sessions.json
│   ├── questions.json
│   ├── blueprints.json
│   ├── hall-tickets.json
│   ├── test-packs.json
│   ├── scores.json
│   ├── alerts.json
│   └── users.json
│
├── styles/
│   ├── tokens.css                ← All CSS custom properties
│   ├── typography.css            ← Font assignments, type scale
│   └── components.css            ← Non-Tailwind component styles
│
└── public/
    └── photos/                   ← Candidate photo placeholders
```

### SPA Shell Pattern

`index.html` is the single entry point. The router swaps page content into `<div id="app">`. Shared elements (navbar, sidebar) are injected once and persist across navigation.

```html
<!-- index.html — skeleton only -->
<!DOCTYPE html>
<html lang="en" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admission Test Platform</title>
    <!-- All CDN links from Section 3 -->
  </head>
  <body class="bg-parchment font-body text-ink">
    <div id="navbar-mount"></div>

    <div class="flex">
      <div id="sidebar-mount"></div>
      <main id="app" class="flex-1 min-h-screen"></main>
    </div>

    <script type="module" src="/js/scroll.js"></script>
    <script type="module" src="/js/store.js"></script>
    <script type="module" src="/js/router.js"></script>
    <script type="module" src="/components/navbar.js"></script>
    <script type="module" src="/components/sidebar.js"></script>
  </body>
</html>
```

---

## 5. Aesthetic System

### Direction: Institutional Precision

**Refined institutional** — the feel of a serious financial terminal crossed with editorial publication design. Authoritative without being cold. Every decision should ask: _does this feel like it belongs in the control room of a national exam?_

### Color Tokens

```css
/* styles/tokens.css */
:root {
  --color-primary: #0a3d1f; /* forest green — authoritative */
  --color-primary-light: #1a6b38;
  --color-primary-muted: #e8f0ea;
  --color-accent: #c8a84b; /* warm gold — pairs like a seal */
  --color-accent-muted: #f5edd6;

  --color-bg: #f5f2eb; /* warm parchment — NEVER pure white */
  --color-surface: #ffffff;
  --color-surface-raised: #fdfcf9;
  --color-surface-sunken: #ede9df;

  --color-text-primary: #1a1a18;
  --color-text-secondary: #4a4a45;
  --color-text-muted: #7a7a73;
  --color-text-inverse: #f5f2eb;

  --color-border: #d8d4c8;
  --color-border-strong: #b8b4a8;

  --color-danger: #c0392b;
  --color-danger-muted: #fdecea;
  --color-success: #1a6b38;
  --color-success-muted: #e8f0ea;
  --color-warning: #d4850a;
  --color-warning-muted: #fdf3dc;
  --color-info: #1b5e93;
  --color-info-muted: #e6f0fa;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-inout: cubic-bezier(0.87, 0, 0.13, 1);
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 700ms;
}

[data-theme="dark"] {
  --color-bg: #0d1a13;
  --color-surface: #132118;
  --color-surface-raised: #1a2d20;
  --color-surface-sunken: #0a1410;
  --color-text-primary: #e8f0ea;
  --color-text-secondary: #a8b8ab;
  --color-text-muted: #607868;
  --color-border: #1e3025;
  --color-border-strong: #2a4035;
}
```

### Typography

```css
/* styles/typography.css */

h1,
h2,
.font-display {
  font-family: "Cormorant Garamond", Georgia, serif;
}
body,
p,
label,
button,
input,
select,
td,
th {
  font-family: "DM Sans", system-ui, sans-serif;
}
.font-mono,
code,
.app-id,
.hash,
.score-value {
  font-family: "JetBrains Mono", monospace;
}

h1 {
  font-size: 2.5rem;
  font-weight: 400;
  line-height: 1.15;
}
h2 {
  font-size: 1.75rem;
  font-weight: 400;
  line-height: 1.25;
}
h3 {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.35;
}
h4 {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}
```

### Status → Color Map

```javascript
// js/utils.js
export const STATUS_COLORS = {
  booked: { bg: "bg-info-muted", text: "text-info", dot: "#1B5E93" },
  "checked-in": {
    bg: "bg-primary-muted",
    text: "text-primary",
    dot: "#0A3D1F",
  },
  "in-progress": {
    bg: "bg-warning-muted",
    text: "text-warning",
    dot: "#D4850A",
  },
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
```

---

## 6. Scroll Stack — Mandatory Rules

> These rules are non-negotiable. Every agent must follow them exactly.

### Canonical Boilerplate

This lives in `js/scroll.js`. It is loaded **once** from `index.html`. Never duplicate it.

```javascript
// js/scroll.js
// GSAP and Lenis are globals from CDN — no imports needed.

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0); // MANDATORY — no lag compensation

export const lenis = new Lenis({
  lerp: 0.08, // buttery, weighty feel — do not change
  smoothWheel: true,
  autoRaf: false, // GSAP ticker owns the RAF loop — critical
});

// Feed Lenis into GSAP's RAF — THE sync mechanism
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Keep ScrollTrigger in sync with Lenis virtual scroll position
lenis.on("scroll", ScrollTrigger.update);

// Expose globally for pages that need lenis.stop() / lenis.start()
window.__lenis = lenis;
```

### Using in Pages

```javascript
// Stop Lenis (test player page — full-screen, no scroll)
window.__lenis?.stop();

// Restart on navigation away
window.addEventListener("hashchange", () => window.__lenis?.start(), {
  once: true,
});
```

### Approved Animation Patterns

```javascript
// Staggered card/list reveal
gsap.fromTo(
  ".card-item",
  { opacity: 0, y: 50 },
  {
    opacity: 1,
    y: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "power2.out",
    scrollTrigger: { trigger: ".card-grid", start: "top 80%" },
  },
);

// Stat count-up on scroll
function animateCountUp(el, target) {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: 1.4,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 90%" },
    onUpdate: () => {
      el.textContent = Math.round(obj.val).toLocaleString();
    },
  });
}

// Pinned stats bar (NOC dashboard)
ScrollTrigger.create({
  trigger: "#stats-bar",
  start: "top top",
  end: "bottom+=600 top",
  pin: true,
  pinSpacing: false,
});

// Parallax hero background
gsap.to(".hero-bg", {
  yPercent: -20,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: true,
  },
});
```

### Scroll Hard Prohibitions

| Prohibited                                           | Reason                                                  |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `CSS scroll-behavior: smooth`                        | Conflicts with Lenis                                    |
| `IntersectionObserver` for animations                | Use ScrollTrigger — breaks with Lenis virtual position  |
| `ScrollSmoother`                                     | Conflicts with Lenis scroll ownership                   |
| `Locomotive Scroll`                                  | Deprecated, redundant                                   |
| `new Lenis({ autoRaf: true })`                       | GSAP ticker owns RAF — never let Lenis run its own loop |
| Multiple Lenis instances                             | One instance in `js/scroll.js` only                     |
| Animating `width`, `height`, `top`, `left`, `margin` | Layout thrash                                           |
| `element.style.top = '...'` for animation            | Use `gsap.to(el, { y: ... })`                           |

---

## 7. Data Layer

### Principle

All data lives in `/data/*.json`. Pages load data via `fetch()` on mount. No server-side rendering, no API routes, no mutations to JSON files.

### Fetch Pattern

```javascript
// js/utils.js
export async function fetchData(filename) {
  const res = await fetch(`/data/${filename}.json`);
  if (!res.ok) throw new Error(`Failed to load ${filename}.json`);
  return res.json();
}

// Usage in any page's data-page-init script
import { fetchData } from "/js/utils.js";
const candidates = await fetchData("candidates");
```

### JSON Schemas

#### `candidates.json`

```json
[
  {
    "applicationId": "APP-2024-00142",
    "name": "Priya Menon",
    "photo": "/public/photos/APP-2024-00142.jpg",
    "programs": ["MBA", "MFA"],
    "attemptCount": 1,
    "cycle": "Cycle1",
    "sessionId": "SES-2024-D1-AM",
    "centerId": "CTR-BLR-01",
    "seatNumber": "A-14",
    "status": "booked",
    "hallTicketId": "HT-2024-00142"
  }
]
```

#### `centers.json`

```json
[
  {
    "centerId": "CTR-BLR-01",
    "name": "Bangalore Center 01",
    "city": "Bangalore",
    "address": "14 MG Road, Bangalore 560001",
    "totalSeats": 120,
    "timezone": "Asia/Kolkata",
    "contact": "center-blr@testplatform.in",
    "sessions": ["SES-2024-D1-AM", "SES-2024-D1-PM"]
  }
]
```

#### `sessions.json`

```json
[
  {
    "sessionId": "SES-2024-D1-AM",
    "centerId": "CTR-BLR-01",
    "date": "2024-11-15",
    "startTime": "09:00",
    "endTime": "12:00",
    "capacity": 120,
    "enrolled": 98,
    "status": "scheduled"
  }
]
```

#### `questions.json`

```json
[
  {
    "id": "Q-00891",
    "type": "MCQ",
    "domain": "Quantitative Aptitude",
    "subdomain": "Arithmetic",
    "difficulty": "medium",
    "bloomLevel": "Application",
    "language": "English",
    "exposureCount": 0,
    "status": "published",
    "body": "If 3x + 7 = 22, what is x?",
    "options": ["3", "4", "5", "6"],
    "answer": 2,
    "authorId": "USR-AUTHOR-04",
    "year": 2024
  }
]
```

#### `blueprints.json`

```json
[
  {
    "id": "BP-001",
    "name": "MBA Standard Blueprint",
    "programs": ["MBA"],
    "sections": [
      {
        "name": "Quantitative Aptitude",
        "itemCount": 30,
        "timeMinutes": 40,
        "difficultyDistribution": { "easy": 10, "medium": 15, "hard": 5 }
      }
    ],
    "navigationRules": "linear",
    "calculatorAllowed": false
  }
]
```

#### `hall-tickets.json`

```json
[
  {
    "hallTicketId": "HT-2024-00142",
    "applicationId": "APP-2024-00142",
    "qrData": "HT-2024-00142|APP-2024-00142|SES-2024-D1-AM|A-14",
    "reportingTime": "08:30",
    "centerMapUrl": "/public/maps/CTR-BLR-01.png",
    "permissibleItems": ["HB Pencil", "Eraser", "Water bottle (transparent)"],
    "examSession": "SES-2024-D1-AM"
  }
]
```

#### `test-packs.json`

```json
[
  {
    "packId": "PACK-2024-D1-AM-001",
    "sessionId": "SES-2024-D1-AM",
    "blueprintId": "BP-001",
    "questionIds": ["Q-00891", "Q-00892"],
    "generatedAt": "2024-11-15T08:55:00Z",
    "hash": "a3f9b2c1d4e5f678abcd1234",
    "status": "sealed",
    "openWindowStart": "2024-11-15T08:55:00Z",
    "openWindowEnd": "2024-11-15T09:00:00Z"
  }
]
```

#### `scores.json`

```json
[
  {
    "applicationId": "APP-2024-00142",
    "sessionId": "SES-2024-D1-AM",
    "program": "MBA",
    "attempt": 1,
    "rawScore": 87,
    "sectionScores": [
      { "section": "Quantitative Aptitude", "score": 24, "max": 30 }
    ],
    "totalScore": 87,
    "exportedToCRM": false
  }
]
```

#### `alerts.json`

```json
[
  {
    "alertId": "ALT-001",
    "centerId": "CTR-BLR-01",
    "sessionId": "SES-2024-D1-AM",
    "type": "connectivity",
    "severity": "warning",
    "message": "Center server heartbeat delayed by 12 seconds.",
    "timestamp": "2024-11-15T09:34:00Z",
    "resolved": false
  }
]
```

#### `users.json`

```json
[
  {
    "userId": "USR-001",
    "name": "Priya Menon",
    "role": "candidate",
    "persona": "candidate",
    "email": "priya@example.com",
    "assignedCenters": [],
    "assignedPrograms": ["MBA"]
  }
]
```

### Data Status Enums

```javascript
// js/utils.js
export const CANDIDATE_STATUSES = [
  "booked",
  "checked-in",
  "in-progress",
  "completed",
  "no-show",
];
export const QUESTION_STATUSES = [
  "draft",
  "peer-review",
  "sme-review",
  "bias-qa",
  "approved",
  "published",
  "retired",
];
export const PACK_STATUSES = [
  "assembling",
  "sealed",
  "dispatched",
  "open",
  "expired",
];
export const ALERT_SEVERITIES = ["info", "warning", "critical"];
export const SESSION_STATUSES = ["scheduled", "live", "completed", "cancelled"];
```

---

## 8. Page Architecture & Routing

### Hash Router

```javascript
// js/router.js
const ROUTES = {
  "/": "/pages/candidate/dashboard.html",
  "/booking": "/pages/candidate/booking.html",
  "/hall-ticket/:id": "/pages/candidate/hall-ticket.html",
  "/dashboard": "/pages/candidate/dashboard.html",
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
  "/session/:sessionId": "/pages/test-player/session.html",
};

async function navigate(hash) {
  const path = hash.replace("#", "") || "/";

  // Kill all previous ScrollTrigger instances before loading new page
  ScrollTrigger.getAll().forEach((t) => t.kill());

  const html = await fetch(matchedFile).then((r) => r.text());
  document.getElementById("app").innerHTML = html;

  // Run the page init script embedded in the partial
  const script = document
    .getElementById("app")
    .querySelector("script[data-page-init]");
  if (script) {
    const fn = new Function(script.textContent);
    fn();
  }
}

window.addEventListener("hashchange", () => navigate(location.hash));
navigate(location.hash);
```

### Page Partial Structure

Every page file is an HTML partial — no `<html>/<head>/<body>` tags:

```html
<!-- pages/candidate/booking.html -->
<div class="p-8 max-w-4xl mx-auto" data-page="booking">
  <h1 class="font-display text-4xl text-primary mb-2">Book Your Slot</h1>
  <p class="text-ink-2 mb-8">Select your program and preferred session.</p>

  <!-- Page content -->
</div>

<script data-page-init type="text/javascript">
  (async function () {
    const { fetchData } = await import("/js/utils.js");
    const sessions = await fetchData("sessions");
    // Build UI, register ScrollTrigger animations, etc.
  })();
</script>
```

---

## 9. Module Inventory

### `(candidate)` — Candidate Journey

| Page                               | Key Features                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `pages/candidate/booking.html`     | 3-step wizard: programs → session picker → confirm. GSAP step slide transitions. Capacity color bands. |
| `pages/candidate/hall-ticket.html` | Print-quality layout. QRCode.js QR. App ID in JetBrains Mono. GSAP stamp entrance animation.           |
| `pages/candidate/dashboard.html`   | Upcoming session card, attempt history, status timeline tracker.                                       |

### `(admin)` — Booking Administration

| Page                        | Key Features                                                              |
| --------------------------- | ------------------------------------------------------------------------- |
| `pages/admin/roster.html`   | Sortable/filterable table (vanilla JS). Filter by center/session/program. |
| `pages/admin/centers.html`  | Center cards with capacity donut charts (Chart.js RadialBar).             |
| `pages/admin/calendar.html` | Month/week calendar grid. Session blocks color-coded by capacity fill.    |

### `(qbms)` — Question Bank Management

| Page                          | Key Features                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `pages/qbms/items.html`       | Kanban by lifecycle status. Client-side filter. GSAP stagger on column load. |
| `pages/qbms/item-detail.html` | Full item view, metadata, review history timeline, version log.              |
| `pages/qbms/blueprints.html`  | Blueprint cards, difficulty distribution (Chart.js stacked bar).             |

### `(exam-ops)` — Test Operations

| Page                             | Key Features                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `pages/exam-ops/test-packs.html` | Pack list, hash display (JetBrains Mono), JIT countdown timer, open window indicator. |
| `pages/exam-ops/assembly.html`   | 4-step pack generation wizard, GSAP progress bar, animated seal step.                 |

### `(proctor)` — Check-in & Monitoring

| Page                          | Key Features                                                        |
| ----------------------------- | ------------------------------------------------------------------- |
| `pages/proctor/check-in.html` | Candidate search, verify card, seat assignment, QR scan simulation. |
| `pages/proctor/monitor.html`  | Visual seat grid by status, hover tooltip, incident log panel.      |

### `(noc)` — Network Operations Center

| Page                       | Key Features                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `pages/noc/dashboard.html` | **Flagship view.** Center health grid, pinned stats bar (GSAP pin), CountUp animations, Chart.js session progress. |
| `pages/noc/alerts.html`    | Alert feed sorted by timestamp, filter by center/severity, resolve toggle.                                         |

### `(scoring)` — Score & Export

| Page                         | Key Features                                                                |
| ---------------------------- | --------------------------------------------------------------------------- |
| `pages/scoring/results.html` | Score table, Chart.js distribution histogram, slide-out score detail panel. |
| `pages/scoring/export.html`  | Mock export: 4-step animated progress, reconciliation log table.            |

### `(test-player)` — Exam Interface

| Page                             | Key Features                                                                                                               |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `pages/test-player/session.html` | **No scroll animations.** Full-viewport layout. Question palette, countdown timer, auto-save, submit modal. Lenis stopped. |

---

## 10. Component Conventions

### Component Pattern

All components are factory functions exported from `/components/*.js`. They return HTML strings and optionally accept a mount element.

```javascript
// components/status-pill.js
import { STATUS_COLORS } from "/js/utils.js";

export function StatusPill(status, size = "md") {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS["draft"];
  const sz = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";
  return `
    <span class="inline-flex items-center gap-1.5 rounded-full border font-body font-medium
                 ${sz} ${c.bg} ${c.text}">
      <span class="w-1.5 h-1.5 rounded-full" style="background:${c.dot}"></span>
      ${status.replace(/-/g, " ")}
    </span>
  `;
}
```

```javascript
// components/count-up.js — wraps GSAP count-up; el must be in DOM before calling
export function CountUp(el, target, opts = {}) {
  const obj = { val: 0 };
  gsap.to(obj, {
    val: target,
    duration: opts.duration ?? 1.4,
    ease: "power2.out",
    scrollTrigger: { trigger: el, start: "top 90%" },
    onUpdate: () => {
      el.textContent = Math.round(obj.val).toLocaleString();
    },
  });
}
```

```javascript
// components/data-table.js — sortable table, pure JS, no library
export function buildTable({ columns, rows, tableClass = "" }) {
  // Returns an HTMLTableElement with sort on th click
  // Client-side sort only — no refetch
}
```

### Sidebar Injection Pattern

```javascript
// components/sidebar.js
import { store } from "/js/store.js";
import { PERSONA_ROUTES } from "/js/router.js";

function render() {
  const { persona } = store.getState();
  const routes = PERSONA_ROUTES[persona];
  document.getElementById("sidebar-mount").innerHTML = `
    <aside class="w-64 min-h-screen bg-surface border-r border-border flex flex-col">
      <div class="p-6 border-b border-border">
        <span class="font-display text-2xl text-primary">ATP</span>
        <span class="ml-2 text-xs text-ink-3 font-mono tracking-widest">ADMISSION TEST</span>
      </div>
      <nav class="flex-1 py-4">
        ${routes
          .map(
            (r) => `
          <a href="#${r.path}"
             class="flex items-center gap-3 px-6 py-3 text-sm font-body text-ink-2
                    hover:bg-primary-muted hover:text-primary transition-colors
                    ${
                      location.hash === "#" + r.path
                        ? "bg-primary-muted text-primary font-medium border-r-2 border-primary"
                        : ""
                    }">
            <span class="opacity-60 w-4 text-center">${r.icon}</span>
            ${r.label}
          </a>
        `,
          )
          .join("")}
      </nav>
    </aside>
  `;
}

store.subscribe(render);
render();
```

---

## 11. Persona System

### Persona → Routes Map

```javascript
// js/router.js — PERSONA_ROUTES export
export const PERSONA_ROUTES = {
  candidate: [
    { path: "/dashboard", label: "My Dashboard", icon: "◈" },
    { path: "/booking", label: "Book a Slot", icon: "◉" },
    { path: "/hall-ticket", label: "Hall Ticket", icon: "◧" },
  ],
  callCenter: [{ path: "/roster", label: "Candidate Roster", icon: "◫" }],
  bookingAdmin: [
    { path: "/roster", label: "Roster", icon: "◫" },
    { path: "/centers", label: "Centers", icon: "◎" },
    { path: "/calendar", label: "Calendar", icon: "◰" },
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
  noc: [
    { path: "/noc", label: "NOC Dashboard", icon: "◰" },
    { path: "/alerts", label: "Alerts", icon: "◱" },
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
```

---

## 12. State Management

### The Store

A plain singleton module — pub/sub pattern, no library.

```javascript
// js/store.js
const _state = {
  persona: "candidate",
  candidateId: "APP-2024-00142",
  activeSessionId: null,
  sidebarOpen: true,
  alertCount: 0,
  darkMode: false,
};

const _listeners = new Set();

export const store = {
  getState: () => ({ ..._state }),
  setState: (patch) => {
    Object.assign(_state, patch);
    _listeners.forEach((fn) => fn(_state));
  },
  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
```

### Rules

```
✓  Persona — goes in store
✓  Active candidateId / sessionId for demo flows — goes in store
✓  Sidebar open/closed — goes in store
✓  Alert count badge — goes in store
✓  Dark mode toggle — goes in store

✗  Server data arrays (candidates[], questions[]) — stays in page-level let variables
✗  Form field state — stays in the page that owns the form
✗  Derived/filtered lists — compute at render time, never store
```

---

## 13. Week-by-Week Task Breakdown

### Phase 1 — Foundation (Weeks 1–2)

#### Week 1: Scaffold, Tokens & Scroll System

**Goal:** Open `index.html` in a browser, see a styled parchment shell with working Lenis scroll.

- [x] Create `index.html` with all CDN `<script>` and `<link>` tags from Section 3
- [x] Configure `tailwind.config` block inline — full color/font token extension
- [x] Create `styles/tokens.css` — all CSS custom properties (colors, motion vars, dark theme)
- [x] Create `styles/typography.css` — font assignments and type scale (h1–h4, body, mono)
- [x] Create `styles/components.css` — base component styles (card, table, pill, badge, drawer)
- [x] Create `js/scroll.js` — canonical Lenis + GSAP boilerplate (lerp 0.08, autoRaf false, lagSmoothing(0), `window.__lenis`)
- [x] Create `js/utils.js` — `fetchData()`, `STATUS_COLORS`, status enums, `formatDate()`, `formatRelativeTime()`
- [x] Seed all 10 JSON files in `/data/` with 20–50 realistic records each
- [x] Smoke test: scroll feels weighted and smooth. No `scroll-behavior` in any `.css`.

**Deliverable:** `index.html` opens in browser. Parchment background. Cormorant Garamond font loads. Lenis scroll works.

---

#### Week 2: Router, Store, Navigation Shell & UI Primitives

**Goal:** Full navigation shell operational. All 10 personas switchable. All placeholder pages reachable.

- [x] Create `js/store.js` — pub/sub singleton
- [x] Create `js/router.js` — hash router: route map, HTML partial fetch, URL param extraction, ScrollTrigger cleanup on navigate
- [x] Create `components/navbar.js` — ATP logotype, PersonaSwitcher, dark mode toggle, alert count badge
- [x] Create `components/sidebar.js` — persona-aware nav items, active state highlight, collapse on mobile
- [x] Create `components/persona-switcher.js` — `<select>` triggers store update, sidebar re-render, redirect to `#/`
- [x] Create placeholder partials for all 16 routes (just heading + "coming soon" copy)
- [x] Build all UI primitives:
  - [x] `components/status-pill.js` — dot + label, status-to-color map
  - [x] `components/badge.js` — program/cycle tags
  - [x] `components/count-up.js` — GSAP + ScrollTrigger count-up
  - [x] `components/hash-display.js` — JetBrains Mono hash + copy button
  - [x] `components/qr-block.js` — QRCode.js wrapper
  - [x] `components/data-table.js` — sortable table builder
- [x] Dark mode: `data-theme="dark"` on `<html>`, persisted via `localStorage`
- [x] Verify all 10 personas render correct sidebar nav items

**Deliverable:** Shell complete. Persona switcher works. Dark mode works. All 16 placeholder pages load.

---

### Phase 2 — Candidate Journey (Weeks 3–4)

#### Week 3: Booking Wizard

**Goal:** Full 3-step booking flow navigable end-to-end.

- [x] `pages/candidate/booking.html` — 3-step wizard markup + `data-page-init` script
- [x] Step 1 — Program selector: multi-checkbox, attempt count note, cycle label badge
- [x] Step 2 — Session grid: loads `sessions.json` + `centers.json`, capacity fill bar (green <60%, amber 60–85%, red >85%)
- [x] Step 3 — Confirm: booking summary card, policy notice, CTA
- [x] Step indicator: progress dots + connecting line, GSAP `scaleX` on fill
- [x] Step transition: GSAP `fromTo` slide (x: 40→0, opacity: 0→1) on step panels
- [x] Disable/lock full sessions (capacity === enrolled)
- [x] On confirm: store update → redirect to `#/hall-ticket/<id>`
- [x] `pages/candidate/dashboard.html` — upcoming session card, attempt history list, status tracker

**Deliverable:** All 3 booking steps navigate. Capacity is visually represented.

---

#### Week 4: Hall-Ticket & Candidate Profile

**Goal:** Print-quality hall-ticket with live QR code.

- [x] `pages/candidate/hall-ticket.html` — loads `hall-tickets.json` + `candidates.json` by URL param
- [x] Hall-ticket layout: university header strip, candidate photo, App ID (mono), program, session, QR code, permissible items, signature strip
- [x] QRCode.js renders from `qrData` field into a `<div id="qr-canvas">`
- [x] GSAP entrance: stamp-like `scale(0.92→1)` + `opacity(0→1)` on page load (~400ms)
- [x] ScrollTrigger: section-by-section reveal as user reads down
- [x] `@media print` in `tokens.css`: hide sidebar/navbar, print `.hall-ticket-body` only
- [x] Call center reschedule: slide-out drawer, re-selector, reason dropdown, policy acknowledgment

**Deliverable:** Hall-ticket renders with live QR. Print layout clean. Reschedule drawer opens.

---

### Phase 3 — QBMS & Test Operations (Weeks 5–6)

#### Week 5: Question Bank (QBMS)

**Goal:** Question bank Kanban with lifecycle columns, filtering, and item detail.

- [x] `pages/qbms/items.html` — loads `questions.json`, renders 7-column Kanban
- [x] Item cards: type badge, domain label, difficulty colour dot, author, exposure count
- [x] Filter sidebar: checkboxes for domain, type, difficulty, Bloom level, year, status. Pure JS array filter.
- [x] GSAP: staggered card entrance per column on load (`stagger: 0.06`)
- [x] `pages/qbms/item-detail.html` — full item: body, options (correct highlighted), all metadata, review history horizontal timeline, version log
- [x] `pages/qbms/blueprints.html` — blueprint cards + detail slide-out panel with Chart.js stacked horizontal bar (difficulty distribution per section)

**Deliverable:** Kanban visible and filterable. Blueprint difficulty chart renders.

---

#### Week 6: Test Generation & JIT Delivery Simulation

**Goal:** Pack dashboard + 4-step assembly wizard.

- [x] `pages/exam-ops/test-packs.html` — loads `test-packs.json`, `sessions.json`, `blueprints.json`
- [x] Pack cards: session date, center, blueprint name, status pill, item count, hash (mono), copy button
- [x] JIT countdown: live `setInterval` MM:SS to `openWindowStart`
- [x] Open window indicator: pulsing green dot (`@keyframes pulse`) when `status === 'open'`
- [x] `pages/exam-ops/assembly.html` — 4-step wizard:
  1. Select blueprint + session
  2. Preview section breakdown table
  3. Generate — GSAP progress bar `scaleX`, 2s simulated delay, hash via `Date.now().toString(36)`
  4. Seal — SVG lock animation (GSAP rotation), "Pack sealed" confirmation
- [x] ScrollTrigger: staggered pack card reveals

**Deliverable:** Pack dashboard loads. Assembly wizard completes all 4 steps.

---

### Phase 4 — Proctor & NOC (Weeks 7–8)

#### Week 7: Check-in & Seat Monitor

**Goal:** Proctor check-in flow and live seat grid.

- [x] `pages/proctor/check-in.html` — candidate search (live filter as user types), verify card, "Mark Checked-In" action, QR scan mock
- [x] `pages/proctor/monitor.html` — CSS grid seat map, status colors, hover tooltip (CSS), incident log form + list
- [x] "Mark Checked-In" updates local data array, GSAP fade-in on status pill change
- [x] QR scan: CSS scan-line `@keyframes` animation over SVG camera-outline box

**Deliverable:** Check-in search works. Seat grid renders correct status colors. Incidents can be logged.

---

#### Week 8: NOC Dashboard

**Goal:** Flagship view — full operations command center.

- [x] `pages/noc/dashboard.html` — loads `centers.json`, `sessions.json`, `alerts.json`, `candidates.json`
- [x] `#stats-bar`: 4 CountUp stats, pinned via `ScrollTrigger.create({ pin: true })`
- [x] Center health grid: card per center with session progress bar, check-in bar, health status pill, heartbeat timestamp
- [x] Session progress Chart.js line chart (simulated check-in over time)
- [x] Bandwidth monitor Chart.js line chart (3 center series)
- [x] GSAP: staggered center card reveals, CountUp on stat numbers
- [x] `pages/noc/alerts.html` — alert cards with severity left-border strip, filter controls, resolve toggle
- [x] GSAP: alert cards slide in from right on load (`stagger: 0.05`)

**Deliverable:** NOC dashboard is visually rich. Stats bar pins. All center cards render. Alerts are filterable.

---

### Phase 5 — Test Player & Scoring (Weeks 9–10)

#### Week 9: Secure Test Player

**Goal:** Full-screen exam interface. No scroll. No sidebar.

- [x] `pages/test-player/session.html` — standalone full-viewport layout (no sidebar/navbar wrapper classes)
- [x] On init: `window.__lenis?.stop()`; on `hashchange` away: `window.__lenis?.start()`
- [x] Layout: left palette sidebar + main question area + top bar
- [x] Question palette: numbered CSS grid, color-coded (unanswered/answered/marked)
- [x] Answer options: custom CSS radio, deselectable on re-click
- [x] Countdown: `setInterval` HH:MM:SS, amber at 10min, red at 5min, auto-submit at 00:00
- [x] Auto-save indicator: "Saved just now" → "Saved 5s ago" cycling text
- [x] Mark for review toggle: updates palette color
- [x] Submit modal: CSS `opacity`/`transform` transition, answered/unanswered/marked count summary
- [x] Lockdown bar: non-dismissable amber strip "🔒 Secure Mode Active"

**Deliverable:** Exam player navigable. Timer counts. Palette updates. Submit modal reachable.

---

#### Week 10: Scoring & CRM Export

**Goal:** Score analyst results table and animated export flow.

- [x] `pages/scoring/results.html` — loads `scores.json` + `candidates.json`
- [x] Results table (`data-table.js`): App ID, Name, Program, Attempt, Section Scores, Total, CRM Status. Sortable.
- [x] Row click: slide-out panel with section score progress bars, percentile mock
- [x] Chart.js bar histogram: score distribution
- [x] GSAP ScrollTrigger: chart reveal, staggered row entrance
- [x] `pages/scoring/export.html` — filter controls, preview table, 4-step export animation:
  1. Validating (spinner)
  2. Signing (lock icon)
  3. Uploading (GSAP `scaleX` progress bar)
  4. Complete (checkmark, timestamp, record count)
- [x] Reconciliation log: table of past exports with hash (mono), timestamp, count, download icon

**Deliverable:** Results table loads. Histogram renders. Export flow completes to confirmation.

---

### Phase 6 — Polish & QA (Weeks 11–12)

#### Week 11: Motion Polish Pass

- [x] Grep all files: zero `IntersectionObserver` for animation triggers
- [x] Grep all `.css`: zero `scroll-behavior: smooth`
- [x] Grep all GSAP calls: no animation of `width`, `height`, `top`, `left`, `margin`
- [x] Verify `ScrollTrigger.getAll().forEach(t => t.kill())` fires in router `navigate()` on every route change
- [x] Test Lenis lerp feel on Chrome, Firefox, Safari
- [x] NOC: verify stats bar pin timing at 768px, 1280px, 1920px viewports
- [x] Test player: confirm `lenis.stop()` / `lenis.start()` fires correctly on entry/exit
- [x] Hall-ticket: stamp entrance animation is snappy (~400ms), not sluggish
- [x] Add `prefers-reduced-motion` guard on all GSAP animations:
  ```javascript
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // gsap animation here
  }
  ```

---

#### Week 12: Accessibility, Dark Mode & Final QA

- [ ] Dark mode: verify all `[data-theme="dark"]` token overrides correct on every page
- [ ] Dark mode toggle persists to `localStorage`
- [ ] WCAG AA contrast audit: all text/bg combos ≥ 4.5:1
- [ ] `:focus-visible` rings on all interactive elements
- [ ] Keyboard navigation: Tab through booking wizard, question palette, table headers
- [ ] ARIA: `role="status"` on auto-save, `aria-label` on icon buttons, `aria-sort` on table headers, `role="alert"` on critical alerts
- [ ] Mobile (768px): sidebar collapses to hamburger, NOC grid reflows to 2 columns
- [ ] Cross-persona QA: cycle all 10 personas, no JS errors, correct nav, correct data
- [ ] `fetch()` error handling: all data loads show empty states on failure, not broken UI
- [ ] Console is clean (zero warnings, zero errors) on every page
- [ ] To run: `npx serve .` or `python -m http.server 3000`
- [ ] Update this `AGENTS.md` with any decisions made during polish

**Deliverable:** Production-ready static demo. Serves from any static file server. All personas work. Dark mode polished.

---

## 14. Hard Constraints — Never Violate

### Scroll

```
✗  CSS scroll-behavior: smooth               → Conflicts with Lenis
✗  IntersectionObserver for animations       → Always ScrollTrigger
✗  ScrollSmoother                            → Conflicts with Lenis
✗  Locomotive Scroll                         → Deprecated
✗  new Lenis({ autoRaf: true })              → GSAP ticker owns RAF
✗  More than one Lenis instance              → One in js/scroll.js only
✗  lenis.scrollTo() inside ScrollTrigger     → Creates feedback loop
```

### Animations

```
✗  Animate: width, height, top, left, margin, padding  → Layout thrash
✗  element.style.top = '...' for animation             → Use gsap.to(el, { y: ... })
✓  Animate: transform (x, y, scale, rotate), opacity only
✓  CSS transitions for static UI (buttons, tooltips)
✗  CSS transitions for scroll-linked animations        → Must be GSAP + ScrollTrigger
```

### Typography

```
✗  Inter, Roboto, Arial, or system-ui as display font
✓  Cormorant Garamond  →  all h1, h2, hero, display text
✓  DM Sans             →  all body, UI, nav, labels, buttons
✓  JetBrains Mono      →  all IDs, hashes, scores, codes, timestamps
```

### Color

```
✗  #FFFFFF as page/body background      → Use #F5F2EB (parchment)
✗  Purple gradients                      → Not in this palette
✗  Hardcoded hex values outside tokens.css  → Always CSS variables
✗  Arbitrary Tailwind values bg-[#abc]   → Use named token classes only
```

### Architecture

```
✗  Any JS framework (React, Vue, Angular, Svelte)  → Vanilla JS only
✗  npm install for any dependency                   → CDN only
✗  Build steps (webpack, vite, parcel, rollup)      → Must open directly in browser
✗  API routes or backend server                     → fetch() from /data/*.json only
✗  Mutating JSON files at runtime                   → JSON is read-only source of truth
✗  <html>/<head>/<body> tags in page partials        → Partials are content fragments only
```

### Test Player Page

```
✗  Scroll animations on session.html     → window.__lenis.stop() on mount
✗  Sidebar or navbar in exam layout      → Standalone full-viewport layout only
✗  GSAP ScrollTrigger on exam page       → No scroll triggers
✓  CSS transitions only for exam UI state changes
✓  window.__lenis.start() when navigating away from exam
```

---

_Update this file whenever architectural decisions change, new modules are added, CDN versions are bumped, or constraints evolve. This file is the source of truth for all agents and contributors._
