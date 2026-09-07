let allUnits = [];
const LIST_STORAGE_KEY = "armory-current-list";

/* ---------------- Shared helpers ---------------- */

async function loadUnits() {
  try {
    const res = await fetch("data/inventory.json");
    allUnits = await res.json();
  } catch (err) {
    console.error("Could not load data/inventory.json", err);
    allUnits = [];
  }
  populateFactionFilters();
  renderCollection();
  renderBuilder();
}

function getImageList(item) {
  if (Array.isArray(item.images) && item.images.length) return item.images;
  if (item.image) return [item.image];
  return [];
}

function uniqueFactions() {
  return [...new Set(allUnits.map((u) => u.faction).filter(Boolean))].sort();
}

function populateFactionFilters() {
  const factions = uniqueFactions();
  [document.getElementById("factionFilter"), document.getElementById("builderFactionFilter")].forEach((select) => {
    factions.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      select.appendChild(opt);
    });
  });
}

/* ---------------- View switching ---------------- */

document.querySelectorAll(".view-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".view-tab").forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    const view = tab.dataset.view;
    document.getElementById("view-collection").hidden = view !== "collection";
    document.getElementById("view-builder").hidden = view !== "builder";
  });
});

/* ---------------- Collection view ---------------- */

function cardTemplate(item) {
  const images = getImageList(item);
  const mainImageBlock = images.length
    ? `<img src="${images[0]}" alt="${item.name}" loading="lazy" onerror="this.closest('.card-image').innerHTML='No image yet'">`
    : "No image yet";
  const thumbStrip = images.length > 1
    ? `<div class="thumb-strip">${images.map((src, i) => `<button class="thumb ${i === 0 ? "active" : ""}" data-src="${src}"><img src="${src}" alt="" loading="lazy"></button>`).join("")}</div>`
    : "";

  return `
    <article class="card">
      <div class="card-image">${mainImageBlock}</div>
      ${thumbStrip}
      <div class="card-body">
        <div class="tag-row">
          <span class="tag status-${item.painted_status || "Unpainted"}">${item.painted_status || "Unpainted"}</span>
        </div>
        <h3 class="card-name">${item.name}</h3>
        <p class="card-meta">${[item.faction, item.role].filter(Boolean).join(" · ")}</p>
        <div class="card-points">
          <span>Qty owned: ${item.quantity_owned ?? "—"}</span>
          <strong>${item.points_cost ?? "—"} pts</strong>
        </div>
        ${item.notes ? `<p class="card-notes">${item.notes}</p>` : ""}
        ${item.paint_plan ? `<p class="card-notes"><em>Paint plan: ${item.paint_plan}</em></p>` : ""}
      </div>
    </article>
  `;
}

function renderCollection() {
  const faction = document.getElementById("factionFilter").value;
  const status = document.getElementById("statusFilter").value;
  const query = document.getElementById("searchInput").value.trim().toLowerCase();

  const filtered = allUnits.filter((u) => {
    const factionOk = faction === "all" || u.faction === faction;
    const statusOk = status === "all" || u.painted_status === status;
    const haystack = [u.name, u.role, ...(u.tags || [])].join(" ").toLowerCase();
    const searchOk = !query || haystack.includes(query);
    return factionOk && statusOk && searchOk;
  });

  document.getElementById("cardGrid").innerHTML = filtered.map(cardTemplate).join("");
  document.getElementById("emptyState").hidden = filtered.length > 0;

  const totalModels = filtered.reduce((sum, u) => sum + (Number(u.quantity_owned) || 0), 0);
  document.getElementById("totalsStrip").innerHTML = `
    <span><strong>${filtered.length}</strong> unit${filtered.length === 1 ? "" : "s"} shown</span>
    <span><strong>${totalModels}</strong> total models</span>
  `;
}

document.getElementById("factionFilter").addEventListener("change", renderCollection);
document.getElementById("statusFilter").addEventListener("change", renderCollection);
document.getElementById("searchInput").addEventListener("input", renderCollection);

document.getElementById("cardGrid").addEventListener("click", (e) => {
  const thumb = e.target.closest(".thumb");
  if (!thumb) return;
  const card = thumb.closest(".card");
  const mainImg = card.querySelector(".card-image img");
  if (mainImg) mainImg.src = thumb.dataset.src;
  card.querySelectorAll(".thumb").forEach((t) => t.classList.remove("active"));
  thumb.classList.add("active");
});

/* ---------------- Army list builder ---------------- */

function loadCurrentList() {
  try {
    const raw = localStorage.getItem(LIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCurrentList(list) {
  localStorage.setItem(LIST_STORAGE_KEY, JSON.stringify(list));
}

function addToList(unitId) {
  const list = loadCurrentList();
  list[unitId] = (list[unitId] || 0) + 1;
  saveCurrentList(list);
  renderBuilder();
}

function removeFromList(unitId) {
  const list = loadCurrentList();
  if (!list[unitId]) return;
  list[unitId] -= 1;
  if (list[unitId] <= 0) delete list[unitId];
  saveCurrentList(list);
  renderBuilder();
}

function renderBuilder() {
  const faction = document.getElementById("builderFactionFilter").value;
  const available = allUnits.filter((u) => faction === "all" || u.faction === faction);

  document.getElementById("availableUnits").innerHTML = available.map((u) => `
    <div class="unit-row">
      <div class="unit-row-main">
        <span class="unit-row-name">${u.name}</span>
        <span class="unit-row-meta">${[u.faction, u.role].filter(Boolean).join(" · ")}</span>
      </div>
      <span class="unit-row-pts">${u.points_cost ?? "—"} pts</span>
      <button data-add="${u.id}">Add</button>
    </div>
  `).join("") || `<p class="card-notes">No units for this faction yet.</p>`;

  const list = loadCurrentList();
  const entries = Object.entries(list).map(([id, qty]) => ({ unit: allUnits.find((u) => u.id === id), qty })).filter((e) => e.unit);

  document.getElementById("currentList").innerHTML = entries.length
    ? entries.map(({ unit, qty }) => `
        <div class="unit-row">
          <div class="unit-row-main">
            <span class="unit-row-name">${qty}× ${unit.name}</span>
            <span class="unit-row-meta">${[unit.faction, unit.role].filter(Boolean).join(" · ")}</span>
          </div>
          <span class="unit-row-pts">${(unit.points_cost || 0) * qty} pts</span>
          <button class="remove" data-remove="${unit.id}">Remove</button>
        </div>
      `).join("")
    : `<p class="card-notes">No units added yet — pick some from the left.</p>`;

  const totalPts = entries.reduce((sum, { unit, qty }) => sum + (Number(unit.points_cost) || 0) * qty, 0);
  const limit = Number(document.getElementById("pointsLimit").value) || 0;
  const pct = limit > 0 ? Math.min((totalPts / limit) * 100, 100) : 0;
  const bar = document.getElementById("pointsBar");
  bar.style.width = pct + "%";
  bar.classList.toggle("over", totalPts > limit);
  document.getElementById("pointsReadout").textContent = `${totalPts} / ${limit} pts` + (totalPts > limit ? " — over limit!" : "");
}

document.getElementById("builderFactionFilter").addEventListener("change", renderBuilder);
document.getElementById("pointsLimit").addEventListener("input", renderBuilder);
document.getElementById("clearListBtn").addEventListener("click", () => {
  saveCurrentList({});
  renderBuilder();
});

document.getElementById("availableUnits").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (btn) addToList(btn.dataset.add);
});
document.getElementById("currentList").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-remove]");
  if (btn) removeFromList(btn.dataset.remove);
});

loadUnits();
