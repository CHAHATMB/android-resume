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

// ── Card cursor glow ─────────────────────────────────
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
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
