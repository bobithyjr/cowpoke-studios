/* ================================
   ELEMENT REFERENCES (SAFE)
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
   STATE
================================ */

let heroVideos = [];
let heroIndex = 0;
let heroTimer = null;

/* ================================
   PLAYER
================================ */

function openVideo(video) {
  if (!video) return;

  if (video.source === "youtube") {
    playerFrame.src =
      `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
  } else if (video.videoUrl) {
    playerFrame.src = video.videoUrl;
  }

  player?.classList.remove("hidden");
}

function closePlayer() {
  if (!playerFrame || !player) return;
  playerFrame.src = "";
  player.classList.add("hidden");
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
  card.style.backgroundImage = `url(${video.thumbnail})`;
  card.title = video.title;

  card.addEventListener("click", () => openVideo(video));
  return card;
}

function renderRow(videos, container) {
  if (!container || !Array.isArray(videos)) return;

  container.innerHTML = "";
  videos.forEach(v => container.appendChild(createVideoCard(v)));
}

/* ================================
   HERO (SAFE)
================================ */

function renderHero(video) {
  if (!hero || !video) return;

  hero.style.backgroundImage = `url(${video.thumbnail})`;
  heroTitle.textContent = video.title;
  heroPlay.onclick = () => openVideo(video);
}

function startHeroRotation() {
  if (!hero || heroVideos.length === 0) return;

  renderHero(heroVideos[0]);

  heroTimer = setInterval(() => {
    heroIndex = (heroIndex + 1) % heroVideos.length;
    renderHero(heroVideos[heroIndex]);
  }, 8000);
}

/* ================================
   INIT
================================ */

async function init() {
  try {
    const res = await fetch("/api/videos");
    const data = await res.json();

    // HERO (only on index.html)
    if (hero && Array.isArray(data.hero)) {
      heroVideos = data.hero;
      startHeroRotation();
    }

    // ROWS (safe everywhere)
    renderRow(data.latest, latestRow);
    renderRow(data.movies, moviesRow);
    renderRow(data.trailers, trailersRow);

  } catch (err) {
    console.error("Failed to load videos:", err);
  }
}

init();
