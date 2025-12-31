/* ================================
   CONFIG
================================ */

const MOCK_MODE = true; // ← TURN OFF LATER

/* ================================
   ELEMENT REFERENCES
================================ */

const hero = document.getElementById("hero");
const heroTitle = document.getElementById("hero-title");
const heroPlay = document.getElementById("hero-play");

const latestRow = document.getElementById("latest-row");
const moviesRow = document.getElementById("movies-row");
const trailersRow = document.getElementById("trailers-row");

const player = document.getElementById("player");
const playerFrame = document.getElementById("player-frame");
const closePlayerBtn = document.getElementById("close-player");

/* ================================
   MOCK DATA
================================ */

function randomColor() {
  return `hsl(${Math.random() * 360}, 70%, 45%)`;
}

function generateMockVideos(count, prefix) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${prefix}-${i}`,
    source: "youtube",
    youtubeId: "mock",
    title: `${prefix} Title ${i + 1}`,
    thumbnail: null,
    color: randomColor()
  }));
}

function getMockData() {
  return {
    hero: generateMockVideos(3, "Featured"),
    latest: generateMockVideos(10, "Latest"),
    movies: generateMockVideos(8, "Movie"),
    trailers: generateMockVideos(6, "Trailer")
  };
}

/* ================================
   PLAYER (DISABLED IN MOCK)
================================ */

function openVideo(video) {
  if (MOCK_MODE) {
    alert(`PLAY: ${video.title}`);
    return;
  }

  if (video.source === "youtube") {
    playerFrame.src =
      `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
  } else if (video.videoUrl) {
    playerFrame.src = video.videoUrl;
  }

  player?.classList.remove("hidden");
}

function closePlayer() {
  playerFrame.src = "";
  player?.classList.add("hidden");
}

closePlayerBtn?.addEventListener("click", closePlayer);
player?.querySelector(".player-backdrop")
  ?.addEventListener("click", closePlayer);

/* ================================
   RENDER HELPERS
================================ */

function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  if (video.thumbnail) {
    card.style.backgroundImage = `url(${video.thumbnail})`;
  } else {
    card.style.background = video.color;
  }

  const label = document.createElement("span");
  label.textContent = video.title;
  card.appendChild(label);

  card.addEventListener("click", () => openVideo(video));
  return card;
}

function renderRow(videos, container) {
  if (!container || !Array.isArray(videos)) return;

  container.innerHTML = "";
  videos.forEach(v => container.appendChild(createVideoCard(v)));
}

/* ================================
   HERO
================================ */

let heroVideos = [];
let heroIndex = 0;

function renderHero(video) {
  if (!hero || !video) return;

  hero.style.background =
    video.thumbnail ? `url(${video.thumbnail})` : video.color;

  heroTitle.textContent = video.title;
  heroPlay.onclick = () => openVideo(video);
}

function startHeroRotation() {
  if (!hero || heroVideos.length === 0) return;

  renderHero(heroVideos[0]);

  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroVideos.length;
    renderHero(heroVideos[heroIndex]);
  }, 8000);
}

/* ================================
   INIT
================================ */

async function init() {
  let data;

  if (MOCK_MODE) {
    data = getMockData();
  } else {
    const res = await fetch("/api/videos");
    data = await res.json();
  }

  // HERO
  if (hero) {
    heroVideos = data.hero || [];
    startHeroRotation();
  }

  // ROWS
  renderRow(data.latest, latestRow);
  renderRow(data.movies, moviesRow);
  renderRow(data.trailers, trailersRow);
}

init();
