const API_KEY = "AIzaSyB4KnPwmk9KLhIJHPi3hh-FeMrX9fSoBC8";

const PLAYLISTS = {
  movies: "PLF-AxuO9kk6-zdMcwUOT0y9H_k7jzNUVF",
  trailers: "PLF-AxuO9kk68QZ7si2HYvr0G0SGfcjgNs"
};

async function fetchPlaylist(playlistId, max = 12) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?part=snippet&playlistId=${playlistId}` +
    `&maxResults=${max}&key=${API_KEY}`
  );
  const data = await res.json();
  return data.items || [];
}

function createCard(video) {
  const videoId = video.snippet.resourceId.videoId;

  const card = document.createElement("div");
  card.className = "video-card";
  card.style.backgroundImage =
    `url(${video.snippet.thumbnails.high.url})`;

  card.innerHTML = `
    <div class="video-overlay">
      <div class="play-icon">▶</div>
      <div class="video-title">${video.snippet.title}</div>
    </div>
  `;

  card.onclick = () => {
    window.open(
      `https://www.youtube.com/watch?v=${videoId}`,
      "_blank"
    );
  };

  return card;
}

async function init() {
  const movies = await fetchPlaylist(PLAYLISTS.movies);
  const trailers = await fetchPlaylist(PLAYLISTS.trailers);

  const combined = [...movies, ...trailers].sort(
    (a, b) =>
      new Date(b.snippet.publishedAt) -
      new Date(a.snippet.publishedAt)
  );

  /* HERO */
  const hero = document.getElementById("hero");
  if (hero && combined.length) {
    const featured = combined[0];
    const videoId = featured.snippet.resourceId.videoId;

    hero.style.backgroundImage =
      `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`;

    document.getElementById("hero-title").textContent =
      featured.snippet.title;

    document.getElementById("hero-button").onclick = () => {
      window.open(
        `https://www.youtube.com/watch?v=${videoId}`,
        "_blank"
      );
    };
  }

  /* LATEST */
  combined.slice(0, 10).forEach(v =>
    document.getElementById("latest")?.appendChild(createCard(v))
  );

  /* MOVIES */
  movies.forEach(v =>
    document.getElementById("movies")?.appendChild(createCard(v))
  );

  /* TRAILERS */
  trailers.forEach(v =>
    document.getElementById("trailers")?.appendChild(createCard(v))
  );
}

init();
