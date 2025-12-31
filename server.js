import express from "express";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const YT_KEY = process.env.YT_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY;
const DB_PATH = "./data/videos.json";

// PLAYLISTS
const PLAYLISTS = {
  movies: "PLF-AxuO9kk6-zdMcwUOT0y9H_k7jzNUVF",
  trailers: "PLF-AxuO9kk68QZ7si2HYvr0G0SGfcjgNs"
};

// ---------- HELPERS ----------
function loadDB() {
  return JSON.parse(fs.readFileSync(DB_PATH));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function fetchPlaylist(id) {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=25&playlistId=${id}&key=${YT_KEY}`
  );
  const json = await res.json();

  return json.items.map(v => ({
    id: `youtube:${v.snippet.resourceId.videoId}`,
    source: "youtube",
    youtubeId: v.snippet.resourceId.videoId,
    title: v.snippet.title,
    thumbnail: v.snippet.thumbnails.high.url,
    sections: []
  }));
}

// ---------- SYNC FROM YOUTUBE ----------
app.post("/api/admin/sync", async (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY) return res.sendStatus(403);

  const db = loadDB();
  const existingIds = db.map(v => v.id);

  const movies = await fetchPlaylist(PLAYLISTS.movies);
  const trailers = await fetchPlaylist(PLAYLISTS.trailers);

  [...movies, ...trailers].forEach(v => {
    if (!existingIds.includes(v.id)) db.push(v);
  });

  saveDB(db);
  res.json(db);
});

// ---------- ADMIN CRUD ----------
app.get("/api/admin/videos", (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY) return res.sendStatus(403);
  res.json(loadDB());
});

app.post("/api/admin/videos", (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY) return res.sendStatus(403);
  saveDB(req.body);
  res.json({ ok: true });
});

// ---------- PUBLIC API ----------
app.get("/api/videos", (req, res) => {
  const db = loadDB();

  const filter = section =>
    db.filter(v => v.sections.includes(section));

  res.json({
    hero: filter("hero"),
    movies: filter("movies"),
    trailers: filter("trailers"),
    latest: db.slice(-10).reverse()
  });
});

app.listen(3000, () => console.log("CMS running on :3000"));
