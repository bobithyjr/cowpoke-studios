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
   STATE
================================ */

let heroVideos = [];
let heroIndex = 0;
let heroTimer = null;

/* ================================
   PLAYER
================================ */

function openVideo(video) {
  if (video.source === "youtube") {
    playerFrame.src =
      `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;
  } else {
    // future self-hosted support
    playerFrame.src = video.videoUrl;
  }

  player.classList.remove("hidden");
}

function closePlayer() {
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
  if (!container) return;

  container.innerHTML = "";
  videos.forEach(video => {
    container.appendChild(createVideoCard(video));
  });
}

/* ================================
   HERO
================================ */

function renderHero(video) {
  if (!video) return;

  hero.style.backgroundImage = `url(${video.thumbnail})`;
  heroTitle.textContent = video.title;

  heroPlay.onclick = () => openVideo(video);
}

function startHeroRotation() {
  if (!heroVideos.length) return;

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

    // HERO
    heroVideos = data.hero || [];
    startHeroRotation();

    // ROWS
    renderRow(data.latest || [], latestRow);
    renderRow(data.movies || [], moviesRow);
    renderRow(data.trailers || [], trailersRow);

  } catch (err) {
    console.error("Failed to load videos", err);
  }
}

init();
