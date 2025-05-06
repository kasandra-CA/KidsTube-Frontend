const backendURL = "http://localhost:3000/api";
let playlists = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadPlaylists();
  await loadVideos();
});

async function loadPlaylists() {
  const restrictedUserId = localStorage.getItem("restrictedUserId");
  console.log("🎯 restrictedUserId:", restrictedUserId);

  const directPlaylistId = localStorage.getItem("directPlaylistId");
  const token = localStorage.getItem("token");
  const select = document.getElementById("playlistSelector");

  if (!token) {
    alert("⚠️ Debes iniciar sesión como administrador");
    return;
  }

  // Desde adminPlaylists.html
  if (directPlaylistId) {
    try {
      const res = await fetch(`${backendURL}/playlists/${directPlaylistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const playlist = await res.json();
      playlists = [playlist];

      select.innerHTML = `<option value="${playlist._id}" selected>${playlist.name}</option>`;
      localStorage.removeItem("directPlaylistId");
      return;
    } catch (err) {
      console.error("❌ Error al cargar playlist directa:", err);
      alert("Error al cargar la playlist seleccionada.");
      return;
    }
  }

  // Desde adminUsers.html
  if (!restrictedUserId) {
    alert("⚠️ Debes seleccionar primero un perfil desde el panel");
    window.location.href = "adminUsers.html";
    return;
  }

  try {
    const res = await fetch(`${backendURL}/playlists?restrictedUser=${restrictedUserId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    playlists = await res.json();

    select.innerHTML = '<option value="">-- Elegir una Playlist --</option>';
    playlists.forEach(p => {
      const option = document.createElement("option");
      option.value = p._id;
      option.textContent = p.name;
      select.appendChild(option);
    });

    console.log("🎯 Playlists cargadas:", playlists);
  } catch (err) {
    console.error("❌ Error al obtener playlists:", err);
    alert("Error al cargar playlists");
  }
}

async function loadVideos() {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  if (!userId || !token) {
    alert("⚠️ Sesión no válida");
    return;
  }

  try {
    const res = await fetch(`${backendURL}/videos?owner=${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const videos = await res.json();
    renderVideos(videos);
  } catch (err) {
    console.error("❌ Error al obtener videos:", err);
    alert("Error al cargar videos");
  }
}

function renderVideos(videos) {
  const container = document.getElementById("video-list");
  container.innerHTML = "";
  videos.forEach(video => {
    const col = document.createElement("div");
    col.className = "col-md-4";
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <iframe class="card-img-top" src="${video.url}" frameborder="0" allowfullscreen></iframe>
        <div class="card-body">
          <h6 class="card-title">${video.name}</h6>
          <input type="checkbox" value="${video._id}" class="form-check-input" />
          <label class="form-check-label ms-2">Seleccionar</label>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

document.getElementById("assignForm").addEventListener("submit", async e => {
  e.preventDefault();
  const playlistId = document.getElementById("playlistSelector").value;
  if (!playlistId) return alert("⚠️ Selecciona una playlist");

  const selectedVideos = Array.from(document.querySelectorAll("input[type='checkbox']:checked"))
    .map(cb => cb.value);

  if (selectedVideos.length === 0) return alert("⚠️ Selecciona al menos un video");

  const res = await fetch(`${backendURL}/playlists/add-videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ playlistId, videoIds: selectedVideos })
  });

  const result = await res.json();
  alert(result.message || "✅ Videos asignados");
  await loadVideos();
});

async function handleSearch() {
  const input = document.getElementById("youtubeSearchInput");
  const query = input.value.trim();

  if (!query) return alert("❗ Ingresa un término de búsqueda.");

  try {
    const data = await searchYouTube(query);

    if (!data || !data.items || data.items.length === 0) {
      alert("⚠️ No se encontraron resultados.");
      return;
    }

    const resultsContainer = document.getElementById("youtubeResults");
    resultsContainer.innerHTML = "";

    data.items.forEach(video => {
      const videoId = video.id.videoId;
      const title = video.snippet.title;
      const thumbnail = video.snippet.thumbnails.medium.url;

      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <img src="${thumbnail}" class="card-img-top" alt="${title}">
          <div class="card-body">
            <h6 class="card-title">${title}</h6>
            <button class="btn btn-success w-100" onclick="submitVideoFromSearch('${videoId}', '${escapeQuotes(title)}')">➕ Agregar</button>
          </div>
        </div>
      `;

      resultsContainer.appendChild(col);
    });
  } catch (err) {
    console.error("❌ Error al buscar en YouTube:", err);
    alert("❌ Hubo un problema al conectarse con YouTube.");
  }
}

async function submitVideoFromSearch(videoId, title) {
  const url = `https://www.youtube.com/embed/${videoId}`;
  const description = "Video agregado desde búsqueda de YouTube";
  const owner = localStorage.getItem("userId");

  const payload = { name: title, url, description, owner };

  const response = await fetch(`${backendURL}/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  alert(result.message || result.error || "✅ Video agregado");
  await loadVideos();
}

async function submitManualUrl() {
  const url = document.getElementById("manualUrlInput").value;
  const owner = localStorage.getItem("userId");
  const title = "Video agregado manualmente";
  const description = "Enlace pegado por el usuario";

  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    return alert("❌ URL inválida. Debe ser de YouTube.");
  }

  const embedUrl = convertToEmbedUrl(url);
  if (!embedUrl) return alert("❌ No se pudo convertir la URL.");

  const payload = { name: title, url: embedUrl, description, owner };

  const res = await fetch(`${backendURL}/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(payload)
  });

  const result = await res.json();
  alert(result.message || result.error || "✅ Video agregado");
  await loadVideos();
}

function convertToEmbedUrl(url) {
  try {
    const urlObj = new URL(url);
    let videoId = new URLSearchParams(urlObj.search).get("v");
    if (!videoId && urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.split("/")[1];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (e) {
    return null;
  }
}

window.previewVideoFromURL = () => {
  const inputEl = document.getElementById("manualUrlInput");
  const preview = document.getElementById("manualPreview");
  const iframe = document.getElementById("manualIframe");

  if (!inputEl || !preview || !iframe) return;

  const input = inputEl.value.trim();
  const embedUrl = convertToEmbedUrl(input);

  if (embedUrl) {
    iframe.src = embedUrl;
    preview.style.display = "block";
  } else {
    iframe.src = "";
    preview.style.display = "none";
  }
};

function escapeQuotes(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

async function searchYouTube(query) {
  try {
    const apiKey = "AIzaSyDVkVIOSaFUSrgi2XtTS2u5LN3PyB_XX68";
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=6&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error al consultar la API de YouTube:", errorText);
      throw new Error("No se pudo obtener resultados de YouTube");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error en searchYouTube:", error);
    return { items: [] };
  }
}