function compare(a, b) {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

export function buildTable({ columns, rows, tableClass = "" }) {
  const table = document.createElement("table");
  table.className = `w-full border border-border rounded-2xl overflow-hidden bg-surface ${tableClass}`;

  const thead = document.createElement("thead");
  thead.className = "bg-surface-sunken";

  const trh = document.createElement("tr");

  let sort = { key: null, dir: 1 };
  const state = { rows: [...rows] };

  function renderBody() {
    tbody.innerHTML = "";

    state.rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className = "border-t border-border";

      columns.forEach((col) => {
        const td = document.createElement("td");
        td.className = "px-4 py-3 text-sm text-ink-2";
        const v = row[col.key];
        td.innerHTML = col.render ? col.render(v, row) : String(v ?? "");
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    thEls.forEach((th) => {
      const key = th.getAttribute("data-key");
      th.setAttribute(
        "aria-sort",
        sort.key !== key ? "none" : sort.dir === 1 ? "ascending" : "descending",
      );
    });
  }

  const thEls = [];

  columns.forEach((col) => {
    const th = document.createElement("th");
    th.className = "px-4 py-3 text-left text-xs font-mono tracking-[0.18em] text-ink-3";
    th.setAttribute("scope", "col");
    th.setAttribute("data-key", col.key);
    th.setAttribute("aria-sort", "none");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "inline-flex items-center gap-2 hover:text-primary transition-colors";
    btn.innerHTML = `<span>${col.label}</span><span class="opacity-40">⇅</span>`;

    btn.addEventListener("click", () => {
      if (sort.key === col.key) sort.dir *= -1;
      else sort = { key: col.key, dir: 1 };

      const sortFn = col.sortFn
        ? (a, b) => col.sortFn(a, b) * sort.dir
        : (a, b) => compare(a[col.key], b[col.key]) * sort.dir;

      state.rows.sort(sortFn);
      renderBody();
    });

    th.appendChild(btn);
    trh.appendChild(th);
    thEls.push(th);
  });

  thead.appendChild(trh);

  const tbody = document.createElement("tbody");
  renderBody();

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}
