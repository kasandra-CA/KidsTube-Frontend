const backendURL = "http://localhost:3000/api";

function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("token");
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadPlaylists();
    loadVideos();

    document.getElementById("assignForm").addEventListener("submit", assignVideosToPlaylist);
});

async function loadPlaylists() {
    const userId = localStorage.getItem("userId");
    const playlistSelector = document.getElementById("playlistSelector");

    try {
        const res = await fetchWithToken(`${backendURL}/playlists?owner=${userId}`);
        const playlists = await res.json();

        playlists.forEach(p => {
            const option = document.createElement("option");
            option.value = p._id;
            option.textContent = p.name;
            playlistSelector.appendChild(option);
        });
    } catch (err) {
        console.error("Error cargando playlists:", err);
    }
}

async function loadVideos() {
    const videoList = document.getElementById("video-list");
    const userId = localStorage.getItem("userId");

    try {
        const res = await fetchWithToken(`${backendURL}/videos?owner=${userId}`);
        const videos = await res.json();

        videos.forEach(video => {
            const col = document.createElement("div");
            col.className = "col-md-4 mb-3";

            col.innerHTML = `
                <div class="card h-100">
                    <iframe class="card-img-top" src="${convertToEmbedURL(video.url)}" frameborder="0" allowfullscreen></iframe>
                    <div class="card-body">
                        <h5 class="card-title">${video.name}</h5>
                        <p class="card-text">${video.description || ''}</p>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${video._id}" id="video-${video._id}">
                            <label class="form-check-label" for="video-${video._id}">Seleccionar</label>
                        </div>
                    </div>
                </div>
            `;
            videoList.appendChild(col);
        });
    } catch (err) {
        console.error("Error cargando videos:", err);
    }
}

function convertToEmbedURL(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

async function assignVideosToPlaylist(e) {
    e.preventDefault();

    const playlistId = document.getElementById("playlistSelector").value;
    const checkboxes = document.querySelectorAll("#video-list input[type='checkbox']:checked");
    const videoIds = Array.from(checkboxes).map(cb => cb.value);

    if (!playlistId || videoIds.length === 0) {
        alert("⚠️ Debes seleccionar una playlist y al menos un video.");
        return;
    }

    try {
        const res = await fetchWithToken(`${backendURL}/playlists/add-videos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playlistId, videoIds })
        });

        const result = await res.json();
        if (res.ok) {
            alert("✅ Videos agregados a la playlist.");
            window.location.href = "adminPlaylists.html";
        } else {
            alert(result.error || "❌ Error al asignar videos.");
        }
    } catch (err) {
        console.error("Error al asignar videos:", err);
        alert("❌ Error inesperado.");
    }
}
async function handleSearch() {
    const query = document.getElementById("youtubeSearchInput").value;
    const results = await searchYouTube(query);
  
    const container = document.getElementById("youtubeResults");
    container.innerHTML = "";
  
    results.forEach(video => {
      const videoId = video.id.videoId;
      const title = video.snippet.title;
      const thumbnail = video.snippet.thumbnails.medium.url;
  
      const html = `
        <div class="col-md-4">
          <div class="card shadow">
            <img src="${thumbnail}" class="card-img-top">
            <div class="card-body">
              <h6 class="card-title">${title}</h6>
              <button class="btn btn-success w-100" onclick="saveVideo('${title}', 'https://www.youtube.com/watch?v=${videoId}')">Agregar</button>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += html;
    });
  }
  
  async function saveVideo(title, url) {
    const token = localStorage.getItem("token");
  
    const res = await fetch("http://localhost:3000/api/videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ title, url })
    });
  
    const result = await res.json();
    alert(result.message || "Video agregado");
  }
  
  async function submitManualUrl() {
    const url = document.getElementById("manualUrlInput").value;
    if (!url.includes("youtube.com")) return alert("URL no válida");
  
    const title = "Video agregado manualmente";
    saveVideo(title, url);
  }  