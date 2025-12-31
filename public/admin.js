const API_KEY = prompt("Admin key:");

const list = document.getElementById("videos");
const syncBtn = document.getElementById("sync");

async function load() {
  const res = await fetch("/api/admin/videos", {
    headers: { authorization: API_KEY }
  });
  render(await res.json());
}

function render(videos) {
  list.innerHTML = "";

  videos.forEach(v => {
    const div = document.createElement("div");
    div.className = "video";

    div.innerHTML = `
      <img src="${v.thumbnail}">
      <strong>${v.title}</strong>
      ${["hero","movies","trailers"].map(s =>
        `<label>
          <input type="checkbox" ${v.sections.includes(s)?"checked":""}
            onchange="toggle('${v.id}','${s}',this.checked)">
          ${s}
        </label>`
      ).join("")}
    `;

    list.appendChild(div);
  });
}

window.toggle = async (id, section, on) => {
  const res = await fetch("/api/admin/videos", {
    headers: { authorization: API_KEY }
  });
  const db = await res.json();

  const v = db.find(x => x.id === id);
  v.sections = on
    ? [...new Set([...v.sections, section])]
    : v.sections.filter(s => s !== section);

  await fetch("/api/admin/videos", {
    method: "POST",
    headers: {
      authorization: API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(db)
  });

  load();
};

syncBtn.onclick = async () => {
  await fetch("/api/admin/sync", {
    method: "POST",
    headers: { authorization: API_KEY }
  });
  load();
};

load();
