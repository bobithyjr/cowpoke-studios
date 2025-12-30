const API_KEY = "AIzaSyBbIyhTF1CDTVs0yphhNcROXJFpQnPxuMA";
const CHANNEL_ID = "UCdKMVxPe_ggYx86xorqBgtA";

/* NAV ACTIVE */
document.querySelectorAll(".nav-link").forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});

/* PLAYER */
const modal = document.getElementById("player-modal");
const frame = document.getElementById("player-frame");

function openVideo(id) {
  frame.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
  modal.classList.remove("hidden");
}

function closePlayer() {
  frame.src = "";
  modal.classList.add("hidden");
}

document.querySelector(".close-player")?.addEventListener("click", closePlayer);
document.querySelector(".player-backdrop")?.addEventListener("click", closePlayer);

/* FETCH */
async function fetchVideos() {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=30&key=${API_KEY}`
  );
  return (await res.json()).items;
}

/*
  SIMPLE RULES (easy to change later):
  - Movies: title contains "movie"
  - Trailers: title contains "trailer"
*/
function isMovie(v) {
  return v.snippet.title.toLowerCase().includes("movie");
}

function isTrailer(v) {
  return v.snippet.title.toLowerCase().includes("trailer");
}

function renderGrid(videos, container) {
  videos.forEach(v => {
    const card = document.createElement("div");
    card.className = "video-card";
    card.style.backgroundImage = `url(${v.snippet.thumbnails.high.url})`;
    card.onclick = () => openVideo(v.id.videoId);
    container.appendChild(card);
  });
}

async function init() {
  const videos = await fetchVideos();
  if (!videos.length) return;

  /* HERO */
  const hero = document.getElementById("hero");
  if (hero) {
    hero.style.backgroundImage = `url(${videos[0].snippet.thumbnails.high.url})`;
    document.getElementById("hero-title").textContent = videos[0].snippet.title;
    document.getElementById("play-btn").onclick =
      () => openVideo(videos[0].id.videoId);
  }

  /* HOME SECTIONS */
  const latestRow = document.getElementById("latest-row");
  const moviesGrid = document.getElementById("movies-grid");
  const trailersGrid = document.getElementById("trailers-grid");

  if (latestRow) renderGrid(videos.slice(1, 6), latestRow);
  if (moviesGrid) renderGrid(videos.filter(isMovie), moviesGrid);
  if (trailersGrid) renderGrid(videos.filter(isTrailer), trailersGrid);
}

init();

