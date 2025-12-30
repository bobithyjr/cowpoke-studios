// script.js (replace your old file with this)

// CONFIG
const API_KEY = "AIzaSyBbIyhTF1CDTVs0yphhNcROXJFpQnPxuMA";
const CHANNEL_ID = "UCdKMVxPe_ggYx86xorqBgtA";

// DOM helpers
const modal = document.getElementById("player-modal");
const frame = document.getElementById("player-frame");

// NAV ACTIVE
document.querySelectorAll(".nav-link").forEach(link => {
  try {
    if (link.href === window.location.href) link.classList.add("active");
  } catch (e) { /* ignore */ }
});

// PLAYER
function openVideo(id) {
  frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  modal?.classList.remove("hidden");
}
function closePlayer() {
  frame.src = "";
  modal?.classList.add("hidden");
}
document.querySelector(".close-player")?.addEventListener("click", closePlayer);
document.querySelector(".player-backdrop")?.addEventListener("click", closePlayer);

// UTILS
function createVideoObjFromSearchItem(item) {
  return {
    id: item.id?.videoId || item.snippet?.resourceId?.videoId || item.id,
    title: item.snippet?.title || "",
    thumbnail: (item.snippet?.thumbnails?.high?.url) ||
               (item.snippet?.thumbnails?.medium?.url) ||
               (item.snippet?.thumbnails?.default?.url) ||
               ""
  };
}

function renderGrid(videos, container) {
  if (!container) return;
  container.innerHTML = ""; // clear
  videos.forEach(v => {
    if (!v.id) return;
    const card = document.createElement("div");
    card.className = "video-card";
    if (v.thumbnail) card.style.backgroundImage = `url(${v.thumbnail})`;
    card.title = v.title || "";
    card.onclick = () => openVideo(v.id);
    container.appendChild(card);
  });
}

// ERROR DISPLAY (small non-intrusive message in page)
function showError(message) {
  console.error("YouTube widget:", message);
  let el = document.getElementById("yt-error");
  if (!el) {
    el = document.createElement("div");
    el.id = "yt-error";
    el.style.cssText = "color:#f88;padding:12px 20px;";
    const firstSection = document.querySelector(".section") || document.body;
    firstSection?.parentNode?.insertBefore(el, firstSection);
  }
  el.textContent = message;
}

// FETCH HELPERS
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${txt}`);
  }
  return res.json();
}

// 1) Fetch latest (search by channel)
async function fetchLatestVideos(maxResults = 8) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=${maxResults}&key=${API_KEY}`;
  const json = await fetchJson(url);
  if (!Array.isArray(json.items)) return [];
  return json.items.map(createVideoObjFromSearchItem);
}

// 2) Fetch playlists for channel, searching for 'movies' and 'trailers'
async function fetchPlaylists() {
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&key=${API_KEY}`;
  const json = await fetchJson(url);
  if (!Array.isArray(json.items)) return [];
  return json.items.map(p => ({
    id: p.id,
    title: (p.snippet && p.snippet.title) || ""
  }));
}

// 3) Fetch videos from a playlist
async function fetchPlaylistVideos(playlistId, maxResults = 50) {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`;
  const json = await fetchJson(url);
  if (!Array.isArray(json.items)) return [];
  return json.items.map(item => ({
    id: item.snippet?.resourceId?.videoId,
    title: item.snippet?.title || "",
    thumbnail: (item.snippet?.thumbnails?.high?.url) ||
               (item.snippet?.thumbnails?.medium?.url) ||
               (item.snippet?.thumbnails?.default?.url) ||
               ""
  }));
}

// MAIN INIT
async function init() {
  try {
    // Grab DOM targets early
    const heroEl = document.getElementById("hero");
    const heroTitle = document.getElementById("hero-title");
    const playBtn = document.getElementById("play-btn");
    const latestRow = document.getElementById("latest-row");
    const moviesGrid = document.getElementById("movies-grid");
    const trailersGrid = document.getElementById("trailers-grid");
    const videoGridPage = document.getElementById("video-grid"); // used by movies.html

    // 1) Latest videos for home hero + latest-row
    const latest = await fetchLatestVideos(6);
    if (latest && latest.length) {
      if (heroEl) {
        heroEl.style.backgroundImage = `url(${latest[0].thumbnail})`;
        if (heroTitle) heroTitle.textContent = latest[0].title;
        if (playBtn) playBtn.onclick = () => openVideo(latest[0].id);
      }
      if (latestRow) renderGrid(latest.slice(1), latestRow);
    }

    // 2) Playlists -> find Movies and Trailers
    const playlists = await fetchPlaylists();
    // Case-insensitive matching for playlist titles
    const findPlaylist = (names) => {
      const lower = names.map(n => n.toLowerCase());
      return playlists.find(p => lower.some(n => p.title.toLowerCase().includes(n)));
    };

    const moviesPlaylist = findPlaylist(["movie", "movies", "feature"]);
    const trailersPlaylist = findPlaylist(["trailer", "trailers", "teaser"]);

    if (moviesPlaylist) {
      const movies = await fetchPlaylistVideos(moviesPlaylist.id);
      if (moviesGrid) renderGrid(movies, moviesGrid);
      // If this is movies.html (video-grid present), show movies here too
      if (videoGridPage) renderGrid(movies, videoGridPage);
    } else {
      console.warn("No 'Movies' playlist found. Playlists available:", playlists);
    }

    if (trailersPlaylist) {
      const trailers = await fetchPlaylistVideos(trailersPlaylist.id);
      if (trailersGrid) renderGrid(trailers, trailersGrid);
    } else {
      console.warn("No 'Trailers' playlist found. Playlists available:", playlists);
    }

  } catch (err) {
    // Show friendly message and log to console for debugging.
    showError("Could not load YouTube content. Check console for details.");
    console.error(err);
    // Helpful hint for typical API errors:
    if (err.message && err.message.includes("403")) {
      showError("403 error: likely API key restriction or YouTube Data API not enabled. See console.");
    }
  }
}

// Start
init();
