import { PROJECTS } from "./projects.js";

// ── Theme ────────────────────────────────────────────
const root = document.documentElement;
const saved = localStorage.getItem("theme");
if (saved) root.dataset.theme = saved;
document.getElementById("themeToggle").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("theme", next);
});

// ── Sticky nav ───────────────────────────────────────
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("is-stuck", window.scrollY > 24);
onScroll();
addEventListener("scroll", onScroll, { passive: true });

// ── Scroll reveal ────────────────────────────────────
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add("is-in"), i * 70);
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ── Phone tilt ───────────────────────────────────────
const device = document.getElementById("device");
const wrap = device.parentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce) {
  wrap.addEventListener("pointermove", (e) => {
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    device.style.transform = `rotateY(${x * 16}deg) rotateX(${-y * 14}deg) translateZ(20px)`;
  });
  wrap.addEventListener("pointerleave", () => {
    device.style.transform = "rotateY(-8deg) rotateX(3deg)";
  });
  device.style.transform = "rotateY(-8deg) rotateX(3deg)";
}

// ── Projects ─────────────────────────────────────────
const grid = document.getElementById("projectGrid");

const thumbStrip = (p) => {
  if (!p.shots.length) {
    return `<div class="card__media card__media--term"><pre>${p.terminal
      .slice(0, 5)
      .join("\n")}</pre></div>`;
  }
  const cls = p.frame === "phone" ? "card__media--phones" : "card__media--wide";
  const n = p.frame === "phone" ? 3 : 1;
  return `<div class="card__media ${cls}">${p.shots
    .slice(0, n)
    .map(
      (s, i) =>
        `<figure class="shot shot--${i}"><img loading="lazy" src="${s.src}" alt="${p.name} screenshot" /></figure>`
    )
    .join("")}<span class="card__media-badge">${p.shots.length} screens</span></div>`;
};

grid.innerHTML = PROJECTS.map(
  (p) => `
  <article class="card${p.featured ? " card--lg" : ""} reveal" style="--accent:${p.accent}" data-id="${p.id}">
    <div class="card__glow"></div>
    <div class="card__top">
      <span class="card__emoji">${p.emoji}</span>
      <span class="card__kind">${p.kind}${p.stars ? ` · ★ ${p.stars}` : ""}</span>
    </div>
    ${thumbStrip(p)}
    <h3>${p.name}</h3>
    <p class="card__tag">${p.tagline}</p>
    <p class="card__body">${p.body}</p>
    <div class="card__tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
    <div class="card__actions">
      <button class="btn btn--filled btn--sm" data-preview="${p.id}">
        ${p.shots.length ? "Preview" : "Details"}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <a class="btn btn--tonal btn--sm" href="${p.links[0].href}" target="_blank" rel="noopener">${
        p.links[0].href.includes("github.com") ? "Code ↗" : "Install ↗"
      }</a>
    </div>
  </article>`
).join("");
grid.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ── Card cursor glow ─────────────────────────────────
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

// ── App preview modal ────────────────────────────────
const modal = document.getElementById("previewModal");
const el = (id) => document.getElementById(id);
const pvImg = el("pvImg");
const pvDots = el("pvDots");
const pvDevice = el("pvDevice");
const pvLoader = el("pvLoader");
const pvTerm = el("pvTerm");
let current = null;
let index = 0;
let lastFocus = null;

function show(i, dir = 0) {
  if (!current || !current.shots.length) return;
  index = (i + current.shots.length) % current.shots.length;
  const shot = current.shots[index];
  pvLoader.hidden = false;
  pvImg.classList.remove("is-ready");
  pvImg.style.setProperty("--from", dir > 0 ? "44px" : dir < 0 ? "-44px" : "0px");
  pvImg.src = shot.src;
  pvImg.alt = `${current.name} — ${shot.caption}`;
  el("pvCaption").textContent = `${shot.caption}  ·  ${index + 1}/${current.shots.length}`;
  [...pvDots.children].forEach((d, k) => d.classList.toggle("is-on", k === index));
}
pvImg.addEventListener("load", () => {
  pvLoader.hidden = true;
  pvImg.classList.add("is-ready");
});

function openPreview(id) {
  current = PROJECTS.find((p) => p.id === id);
  if (!current) return;
  lastFocus = document.activeElement;
  modal.style.setProperty("--accent", current.accent);
  el("pvKind").textContent = current.kind;
  el("pvTitle").textContent = current.name;
  el("pvTagline").textContent = current.tagline;
  el("pvBody").textContent = current.body;
  el("pvFeatures").innerHTML = current.features.map((f) => `<li>${f}</li>`).join("");
  el("pvTags").innerHTML = current.tags.map((t) => `<span>${t}</span>`).join("");
  el("pvActions").innerHTML = current.links
    .map(
      (l) =>
        `<a class="btn ${l.primary ? "btn--filled" : "btn--tonal"}" href="${l.href}" target="_blank" rel="noopener">${l.label} ↗</a>`
    )
    .join("");

  const hasShots = current.shots.length > 0;
  pvDevice.dataset.frame = current.frame;
  modal.classList.toggle("is-static", !hasShots);
  if (hasShots) {
    pvDots.innerHTML = current.shots
      .map((s, i) => `<button aria-label="${s.caption}" data-go="${i}"></button>`)
      .join("");
    show(0);
    // warm the next few frames
    current.shots.slice(1, 4).forEach((s) => (new Image().src = s.src));
  } else {
    pvDots.innerHTML = "";
    el("pvCaption").textContent = "chahat@terminal";
    pvTerm.textContent = current.terminal.join("\n");
  }
  pvImg.hidden = !hasShots;
  pvTerm.hidden = hasShots;
  pvLoader.hidden = !hasShots;

  modal.hidden = false;
  document.body.style.overflow = "hidden";
  requestAnimationFrame(() => modal.classList.add("is-open"));
  modal.querySelector(".modal__close").focus();
}

function closePreview() {
  modal.classList.remove("is-open");
  document.body.style.overflow = "";
  setTimeout(() => {
    modal.hidden = true;
    pvImg.removeAttribute("src");
  }, 260);
  lastFocus?.focus();
}

document.addEventListener("click", (e) => {
  const open = e.target.closest("[data-preview]");
  if (open) return openPreview(open.dataset.preview);
  if (e.target.closest("[data-close]")) return closePreview();
  const go = e.target.closest("[data-go]");
  if (go) show(Number(go.dataset.go), Number(go.dataset.go) > index ? 1 : -1);
});
el("pvPrev").addEventListener("click", () => show(index - 1, -1));
el("pvNext").addEventListener("click", () => show(index + 1, 1));
addEventListener("keydown", (e) => {
  if (modal.hidden) return;
  if (e.key === "Escape") closePreview();
  if (e.key === "ArrowRight") show(index + 1, 1);
  if (e.key === "ArrowLeft") show(index - 1, -1);
});

// swipe on the device
let startX = null;
pvDevice.addEventListener("pointerdown", (e) => (startX = e.clientX));
pvDevice.addEventListener("pointerup", (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  startX = null;
});

// ── Live clock in the mockup ─────────────────────────
const clock = document.getElementById("clock");
const tick = () =>
  (clock.textContent = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }));
tick();
setInterval(tick, 10000);

document.getElementById("year").textContent = new Date().getFullYear();
