/* =================================================
   STATIC MOCK MODE
   - No YouTube
   - No API calls
   - Safe for Cloudflare Pages / GitHub Pages
================================================= */

/* PAGE NAVIGATION */
function showSection(id) {
  document.querySelectorAll(".page").forEach(page =>
    page.classList.remove("active")
  );
  document.getElementById(id)?.classList.add("active");
}

/* MOCK DATA */
function randomColor() {
  const colors = [
    "#e50914",
    "#1db954",
    "#ff9800",
    "#673ab7",
    "#03a9f4",
    "#009688"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function mockVideo(title) {
  return {
    title,
    color: randomColor()
  };
}

const DATA = {
  hero: [
    mockVideo("PROJECT ATLAS"),
    mockVideo("MIDNIGHT RUN"),
    mockVideo("NEON SKIES")
  ],
  latest: Array.from({ length: 8 }, (_, i) =>
    mockVideo(`Latest Drop ${i + 1}`)
  ),
  movies: Array.from({ length: 12 }, (_, i) =>
    mockVideo(`Feature Film ${i + 1}`)
  ),
  trailers: Array.from({ length: 8 }, (_, i) =>
    mockVideo(`Trailer ${i + 1}`)
  )
};

/* RENDERING */
function createCard(video) {
  const el = document.createElement("div");
  el.className = "video-card";
  el.style.background = video.color;
  el.textContent = video.title;
  return el;
}

function renderRow(items, containerId) {
  const row = document.getElementById(containerId);
  if (!row) return;
  row.innerHTML = "";
  items.forEach(v => row.appendChild(createCard(v)));
}

/* HERO ROTATION */
let heroIndex = 0;

function renderHero() {
  const hero = document.getElementById("hero");
  const title = document.getElementById("hero-title");
  const item = DATA.hero[heroIndex];

  hero.style.background = item.color;
  title.textContent = item.title;

  heroIndex = (heroIndex + 1) % DATA.hero.length;
}

/* INIT */
function init() {
  renderRow(DATA.latest, "latest-row");
  renderRow(DATA.movies, "movies-row");
  renderRow(DATA.trailers, "trailers-row");

  renderHero();
  setInterval(renderHero, 7000);
}

init();
